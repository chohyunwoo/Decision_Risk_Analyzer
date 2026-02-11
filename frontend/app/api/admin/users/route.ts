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

const requireAdmin = async (request: NextRequest) => {
  if (!authClient) {
    return { status: 500, message: "Server auth client not configured." };
  }
  const token = getToken(request);
  if (!token) {
    return { status: 401, message: "Missing access token." };
  }
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return { status: 401, message: "Invalid access token." };
  }
  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (adminError) {
    return {
      status: 500,
      message: adminError instanceof Error ? adminError.message : "Server error."
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profileError || profile?.role !== "admin") {
    return { status: 403, message: "Admin access required." };
  }
  return { status: 200, userId: data.user.id };
};

export const GET = async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.status !== 200) {
    return NextResponse.json(
      { error: adminCheck.message },
      { status: adminCheck.status },
    );
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
      { status: 500 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, name, nickname, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
};

export const POST = async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.status !== 200) {
    return NextResponse.json(
      { error: adminCheck.message },
      { status: adminCheck.status },
    );
  }

  const body = (await request.json()) as {
    id?: string;
    role?: "user" | "admin";
  };

  if (!body?.id || (body.role !== "user" && body.role !== "admin")) {
    return NextResponse.json(
      { error: "Invalid payload." },
      { status: 400 },
    );
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
      { status: 500 },
    );
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: body.role })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
