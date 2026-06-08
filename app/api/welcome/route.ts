import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface Payload {
  name?: string;
  localTime?: string; // e.g. "5:28 PM"
}

const SYSTEM_PROMPT = `You are Juni, Mixbook's memory creative assistant.
The user is opening the gallery to create something new — not from inside a specific memory.
Greet them by first name and the current local time. Be warm, inviting, and oriented toward CREATION.
Constraints:
- A single sentence, under 18 words.
- Start with the time in HH:MM format followed by an em dash.
- Include the user's first name if provided.
- End with: "Choose your starting point."
- No emojis. No quotes. No preamble.`;

export async function POST(req: NextRequest) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    payload = {};
  }

  const name = (payload.name || "friend").trim();
  const localTime = (payload.localTime || "now").trim();
  const apiKey = process.env.ANTHROPIC_API_KEY || "";

  // Fallback static greeting if no key — keeps demo flowing.
  if (!apiKey) {
    return NextResponse.json({
      message: `${localTime} — ${name}, it's time to create. Choose your starting point.`,
      source: "fallback",
    });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const userMessage = `Name: ${name}\nLocal time: ${localTime}\n\nWrite the greeting.`;
    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 80,
      temperature: 0.9,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user" as const, content: userMessage }],
    });
    const text = resp.content
      .map((c: any) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();
    return NextResponse.json({
      message: text || `${localTime} — ${name}, it's time to create. Choose your starting point.`,
      source: "llm",
    });
  } catch (e: any) {
    return NextResponse.json({
      message: `${localTime} — ${name}, it's time to create. Choose your starting point.`,
      source: "fallback-error",
      error: e?.message,
    });
  }
}
