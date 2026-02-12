import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "edge";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const authClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

const getToken = (request: NextRequest) => {
  const header = request.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
};

const getApiBase = () => {
  return process.env.POLAR_SERVER === "sandbox"
    ? "https://sandbox-api.polar.sh/v1"
    : "https://api.polar.sh/v1";
};

const fetchPolar = async (path: string) => {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing POLAR_ACCESS_TOKEN");
  }
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Polar API error: ${response.status} ${detail}`);
  }
  return response.json() as Promise<{ items?: Array<Record<string, unknown>> }>;
};

const createCustomerSession = async (
  customerId: string,
  returnUrl?: string
) => {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing POLAR_ACCESS_TOKEN");
  }
  const response = await fetch(`${getApiBase()}/customer-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      customer_id: customerId,
      return_url: returnUrl
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Polar API error: ${response.status} ${detail}`);
  }
  return response.json() as Promise<{ customer_portal_url?: string }>;
};

export const POST = async (request: NextRequest) => {
  if (!authClient) {
    return NextResponse.json(
      { error: "Server auth client not configured." },
      { status: 500 }
    );
  }

  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
  }

  const userId = data.user.id;
  const email = data.user.email ?? null;

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (adminError) {
    return NextResponse.json(
      {
        error:
          adminError instanceof Error ? adminError.message : "Server error."
      },
      { status: 500 }
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan, polar_customer_id")
    .eq("id", userId)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (profile?.plan !== "pro") {
    return NextResponse.json(
      { error: "Subscription not active." },
      { status: 403 }
    );
  }

  let customerId = profile.polar_customer_id ?? null;

  if (!customerId) {
    try {
      const byExternal = await fetchPolar(
        `/customers?external_id=${encodeURIComponent(userId)}`,
      );
      const externalMatch = (byExternal.items ?? [])[0] as
        | { id?: string | null }
        | undefined;
      customerId = externalMatch?.id ?? null;
    } catch (apiError) {
      return NextResponse.json(
        {
          error:
            apiError instanceof Error ? apiError.message : "Polar API error."
        },
        { status: 500 }
      );
    }
  }

  if (!customerId && email) {
    try {
      const customerResponse = await fetchPolar(
        `/customers?email=${encodeURIComponent(email)}`,
      );
      const customer = (customerResponse.items ?? [])[0] as
        | { id?: string | null }
        | undefined;
      customerId = customer?.id ?? null;
    } catch (apiError) {
      return NextResponse.json(
        {
          error:
            apiError instanceof Error ? apiError.message : "Polar API error."
        },
        { status: 500 }
      );
    }
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "Customer not found." },
      { status: 404 }
    );
  }

  try {
    await fetchPolar(`/customers/${encodeURIComponent(customerId)}`);
  } catch {
    let refreshedId: string | null = null;
    try {
      const byExternal = await fetchPolar(
        `/customers?external_id=${encodeURIComponent(userId)}`,
      );
      const externalMatch = (byExternal.items ?? [])[0] as
        | { id?: string | null }
        | undefined;
      refreshedId = externalMatch?.id ?? null;
    } catch {
      refreshedId = null;
    }
    if (!refreshedId && email) {
      try {
        const customerResponse = await fetchPolar(
          `/customers?email=${encodeURIComponent(email)}`,
        );
        const customer = (customerResponse.items ?? [])[0] as
          | { id?: string | null }
          | undefined;
        refreshedId = customer?.id ?? null;
      } catch {
        refreshedId = null;
      }
    }
    if (!refreshedId) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }
    customerId = refreshedId;
    await supabaseAdmin
      .from("profiles")
      .update({ polar_customer_id: customerId })
      .eq("id", userId);
  }

  const returnUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.POLAR_RETURN_URL ??
    request.nextUrl.origin;

  let session;
  try {
    session = await createCustomerSession(customerId, returnUrl);
  } catch (sessionError) {
    return NextResponse.json(
      {
        error:
          sessionError instanceof Error
            ? sessionError.message
            : "Polar API error."
      },
      { status: 500 }
    );
  }

  if (!session?.customer_portal_url) {
    return NextResponse.json(
      { error: "Missing customer portal URL." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.customer_portal_url });
};
