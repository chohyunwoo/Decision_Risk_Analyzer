import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

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

const payloadSchema = z.object({
  locale: z.string().optional().default("ko"),
  region: z.enum(["KR", "US"]),
  totalSpend: z.number().min(0),
  avgRisk: z.number().min(0).max(100),
  maxRisk: z.number().min(0).max(100),
  count: z.number().min(0),
  trend: z.array(z.number().min(0).max(100)).min(1)
});

const extractText = (json: Record<string, unknown>) => {
  if (typeof json.output_text === "string" && json.output_text.trim()) {
    return json.output_text.trim();
  }
  const output = json.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const message = item as {
        type?: string;
        content?: Array<{ type?: string; text?: string }>;
        text?: string;
      };
      if (typeof message.text === "string" && message.text.trim()) {
        return message.text.trim();
      }
      if (!Array.isArray(message.content)) continue;
      for (const part of message.content) {
        if (
          (part?.type === "output_text" || part?.type === "text") &&
          part.text
        ) {
          return part.text.trim();
        }
      }
    }
  }
  return "";
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
        error:
          adminError instanceof Error ? adminError.message : "Server error."
      },
      { status: 500 }
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan")
    .eq("id", data.user.id)
    .single();

  if (profileError || profile?.plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const { locale, region, totalSpend, avgRisk, maxRisk, count, trend } =
    parsed.data;
  const localeHint =
    locale.startsWith("ja") ? "Japanese" : locale.startsWith("en") ? "English" : "Korean";
  const trendStr = trend.map((v) => v.toFixed(0)).join(", ");

  const prompt = `You are a concise assistant. In ${localeHint}, write exactly 3 short bullet points:
1) Pattern detection from the 7-day risk trend,
2) Next-week goal suggestion,
3) Simple improvement suggestion.
Inputs: region=${region}, total_spend=${totalSpend}, avg_risk=${avgRisk}, max_risk=${maxRisk}, count=${count}, trend=[${trendStr}].
Avoid medical/financial/legal advice.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: prompt,
      max_output_tokens: 140,
      text: { format: { type: "text" } }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: `OpenAI error: ${response.status} ${detail}` },
      { status: 500 }
    );
  }

  const json = (await response.json()) as Record<string, unknown>;
  const text = extractText(json);

  if (!text) {
    return NextResponse.json(
      { error: "Empty AI response." },
      { status: 500 }
    );
  }

  return NextResponse.json({ text });
};
