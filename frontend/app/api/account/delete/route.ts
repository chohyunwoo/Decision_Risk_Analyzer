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

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (adminError) {
    return NextResponse.json(
      {
        error: adminError instanceof Error ? adminError.message : "Server error."
      },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    data.user.id
  );

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
