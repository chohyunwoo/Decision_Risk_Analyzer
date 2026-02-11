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
  menu: z.string().optional().default(""),
  price: z.number().positive(),
  time: z.number().positive(),
  people: z.number().positive(),
  region: z.enum(["KR", "US", "JP"]),
  score: z.number().min(0).max(100),
  label: z.string(),
  locale: z.string().optional().default("ko")
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

  const { menu, price, time, people, region, score, label, locale } =
    parsed.data;
  const perPerson = price / people;
  const localeHint =
    locale.startsWith("ja") ? "Japanese" : locale.startsWith("en") ? "English" : "Korean";

  const prompt = `You are a helpful assistant. Write 3-5 sentences in ${localeHint} explaining the decision risk for a meal. Include a short rationale based on price/time/people and 1 gentle improvement suggestion. Inputs: region=${region}, score=${score}, label=${label}, price_per_person=${perPerson.toFixed(
    2
  )}, time_minutes=${time}, menu=${menu || "unspecified"}. Avoid medical/financial/legal advice.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: prompt,
      max_output_tokens: 120,
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

  return NextResponse.json({ text });
};
