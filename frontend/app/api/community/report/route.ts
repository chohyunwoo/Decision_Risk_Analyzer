import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "edge";

const reportSchema = z.object({
  postId: z.string().uuid(),
  reason: z.enum([
    "spam",
    "harassment",
    "copyright",
    "privacy",
    "illegal",
    "other"
  ]),
  detail: z.string().trim().min(10).max(2000),
  reporterEmail: z.string().trim().email().max(320).optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid report payload." },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;
    const now = new Date().toISOString();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("community_reports")
      .insert({
        post_id: parsed.data.postId,
        reason: parsed.data.reason,
        detail: parsed.data.detail,
        reporter_email: parsed.data.reporterEmail ?? null,
        reporter_ip: ip,
        user_agent: userAgent,
        status: "open",
        created_at: now
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unable to store report. Please email support with details.",
          contactEmail: "gusdndlek12@naver.com"
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        ticketId: data?.id ?? null,
        contactEmail: "gusdndlek12@naver.com"
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while processing report." },
      { status: 500 }
    );
  }
}
