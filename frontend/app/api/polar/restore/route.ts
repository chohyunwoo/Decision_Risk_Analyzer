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

const PRODUCT_ID = "de006367-bcb5-4fdf-9f94-529d9c8cfc69";

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

  if (!email) {
    return NextResponse.json({ restored: false, plan: "free" });
  }

  let customers: Array<{ id?: string | null }> = [];
  try {
    const customerResponse = await fetchPolar(
      `/customers?email=${encodeURIComponent(email)}`,
    );
    customers = (customerResponse.items ?? []) as Array<{ id?: string | null }>;
  } catch (apiError) {
    return NextResponse.json(
      {
        error:
          apiError instanceof Error ? apiError.message : "Polar API error."
      },
      { status: 500 }
    );
  }

  if (customers.length === 0) {
    return NextResponse.json({ restored: false, plan: "free" });
  }

  let matchedOrder: { id?: string | null; customer_id?: string | null } | null =
    null;

  for (const customer of customers) {
    if (!customer.id) continue;
    try {
      const orderResponse = await fetchPolar(
        `/orders?customer_id=${encodeURIComponent(
          customer.id,
        )}&product_id=${PRODUCT_ID}&limit=1&sorting=-created_at`,
      );
      const order = (orderResponse.items ?? [])[0] as
        | { id?: string | null; customer_id?: string | null; paid?: boolean }
        | undefined;
      if (order?.paid) {
        matchedOrder = { id: order.id, customer_id: customer.id };
        break;
      }
    } catch (orderError) {
      return NextResponse.json(
        {
          error:
            orderError instanceof Error ? orderError.message : "Polar API error."
        },
        { status: 500 }
      );
    }
  }

  if (!matchedOrder?.id) {
    return NextResponse.json({ restored: false, plan: "free" });
  }

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

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      plan: "pro",
      polar_customer_id: matchedOrder.customer_id ?? null,
      polar_order_id: matchedOrder.id ?? null
    })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ restored: true, plan: "pro" });
};
