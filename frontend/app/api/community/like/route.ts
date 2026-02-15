import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
  }

  let payload: { postId?: string };
  try {
    payload = (await request.json()) as { postId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const postId = payload.postId?.trim();
  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
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

  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .select("id")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { error: likeInsertError } = await supabaseAdmin.from("post_likes").insert({
    post_id: postId,
    user_id: authData.user.id
  });

  if (likeInsertError) {
    if (likeInsertError.code === "23505") {
      return NextResponse.json({ ok: true, alreadyLiked: true });
    }
    return NextResponse.json({ error: likeInsertError.message }, { status: 500 });
  }

  const { data: countData, error: countError } = await supabaseAdmin.rpc(
    "increment_post_like_count",
    { target_post_id: postId }
  );

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const nextLikeCount =
    typeof countData === "number" ? countData : Number.parseInt(String(countData), 10);

  if (!Number.isFinite(nextLikeCount)) {
    return NextResponse.json({ error: "Invalid like count response." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alreadyLiked: false, likeCount: nextLikeCount });
};

export const GET = async (request: NextRequest) => {
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

  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
  }

  const postId = request.nextUrl.searchParams.get("postId")?.trim();
  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
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

  const { data, error } = await supabaseAdmin
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: !!data });
};
