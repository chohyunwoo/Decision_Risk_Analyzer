// Cloudflare Pages Function: /api/risk-report
// Generates a deterministic, structured report from an existing risk score.
// AI is assistive only; it must not alter the risk score.

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY is not set" }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const validation = validatePayload(payload);
  if (!validation.ok) {
    return json({ error: "ValidationError", details: validation.errors }, 400);
  }

  const input = validation.value;

  const systemPrompt =
    "You are an assistant that writes a decision risk analysis report in Korean. " +
    "You MUST NOT change, recompute, or override the given riskScore or riskLabel. " +
    "You only interpret the provided inputs and explain them. " +
    "Output must match the provided JSON schema exactly.";

  const userPrompt =
    "Create a concise report for the following decision context:\n" +
    JSON.stringify(input, null, 2);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-2024-07-18",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: {
          type: "json_schema",
          json_schema: {
            name: "risk_report",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["summary", "insights", "recommendations"],
              properties: {
                summary: { type: "string", minLength: 1 },
                insights: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 3,
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 3,
                },
              },
            },
          },
        },
      },
      temperature: 0.2,
      max_output_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorText = await safeText(response);
    return json({ error: "OpenAIError", details: errorText }, 502);
  }

  const data = await response.json();
  const output = extractJsonOutput(data);

  if (!output) {
    return json({ error: "InvalidOpenAIResponse", details: data }, 502);
  }

  return json(output, 200);
}

function validatePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object"] };
  }

  const required = ["riskScore", "riskLabel", "region", "priceTotal", "people", "timeMinutes"];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null) {
      errors.push(`${key} is required`);
    }
  }

  if (typeof payload.riskScore !== "number" || payload.riskScore < 0 || payload.riskScore > 100) {
    errors.push("riskScore must be a number between 0 and 100");
  }

  if (!isOneOf(payload.riskLabel, ["LOW", "MEDIUM", "HIGH"])) {
    errors.push("riskLabel must be one of LOW, MEDIUM, HIGH");
  }

  if (!isOneOf(payload.region, ["KR", "US"])) {
    errors.push("region must be KR or US");
  }

  if (typeof payload.priceTotal !== "number" || payload.priceTotal < 0) {
    errors.push("priceTotal must be a positive number");
  }

  if (!Number.isInteger(payload.people) || payload.people < 1) {
    errors.push("people must be an integer >= 1");
  }

  if (!Number.isInteger(payload.timeMinutes) || payload.timeMinutes < 0) {
    errors.push("timeMinutes must be an integer >= 0");
  }

  if (payload.menu !== undefined && payload.menu !== null && typeof payload.menu !== "string") {
    errors.push("menu must be a string");
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: payload };
}

function isOneOf(value, allowed) {
  return allowed.includes(value);
}

function extractJsonOutput(data) {
  if (!data || !data.output || !Array.isArray(data.output)) return null;
  for (const item of data.output) {
    if (item.type === "message" && item.content) {
      const textPart = item.content.find((c) => c.type === "output_text");
      if (textPart && textPart.text) {
        try {
          return JSON.parse(textPart.text);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function safeText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
