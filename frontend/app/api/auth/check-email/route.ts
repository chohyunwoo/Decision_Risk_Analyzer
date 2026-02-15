import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RequestBody = {
  email?: string;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const POST = async (request: NextRequest) => {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawEmail = body.email;
  if (!rawEmail || typeof rawEmail !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const email = normalizeEmail(rawEmail);

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

  const { data: profileRows, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1);

  if (!profileError && (profileRows?.length ?? 0) > 0) {
    return NextResponse.json({ exists: true });
  }

  const perPage = 200;
  const maxPages = 25;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = data?.users ?? [];
    const matched = users.some(
      (user) => normalizeEmail(user.email ?? "") === email
    );
    if (matched) {
      return NextResponse.json({ exists: true });
    }
    if (users.length < perPage) {
      break;
    }
  }

  return NextResponse.json({ exists: false });
};
