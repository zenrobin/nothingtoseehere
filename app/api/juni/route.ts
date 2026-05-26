import { NextRequest, NextResponse } from "next/server";
import type { AppSettings, JuniRecommendationsResponse } from "@/types";
import type { JuniContext, JuniRequestPayload } from "@/lib/juniClient";
import {
  buildRecommendationUserMessage,
  styleDirectives,
} from "@/lib/juniPrompts";
import { generateMockRecommendations } from "@/lib/juniClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let payload: JuniRequestPayload;
  try {
    payload = (await req.json()) as JuniRequestPayload;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { settings, context } = payload;
  const debug = {
    request: null as unknown,
    response: null as unknown,
    context,
  };

  // Mock provider — purely deterministic, no network.
  if (settings.llm.provider === "mock") {
    const data = generateMockRecommendations(context);
    return NextResponse.json({
      data,
      raw: JSON.stringify(data, null, 2),
      debug: { ...debug, response: data },
    });
  }

  // Build prompts
  const systemPrompt = `${settings.prompts.system}\n\n[STYLE DIRECTIVES]\n${styleDirectives(
    settings.style
  )}`;

  const userMessage = buildRecommendationUserMessage(
    settings.prompts.recommendation,
    {
      memory: context.memory,
      photoAnalyses: context.photoAnalyses,
      existingArt: context.existingArt,
      artForms: context.artForms,
      capabilities: context.capabilities,
    }
  );

  try {
    if (settings.llm.provider === "openai") {
      const result = await callOpenAI(systemPrompt, userMessage, settings);
      const parsed = safeParseJson(result.text) as JuniRecommendationsResponse | null;
      return NextResponse.json({
        data: parsed ?? generateMockRecommendations(context),
        raw: result.text,
        debug: { ...debug, request: result.request, response: result.text },
      });
    }
    if (settings.llm.provider === "anthropic") {
      const result = await callAnthropic(systemPrompt, userMessage, settings);
      const parsed = safeParseJson(result.text) as JuniRecommendationsResponse | null;
      return NextResponse.json({
        data: parsed ?? generateMockRecommendations(context),
        raw: result.text,
        debug: { ...debug, request: result.request, response: result.text },
      });
    }
  } catch (e: any) {
    return NextResponse.json(
      {
        data: generateMockRecommendations(context),
        raw: `LLM error, fell back to mock: ${e?.message ?? String(e)}`,
        debug: { ...debug, response: { error: e?.message ?? String(e) } },
      },
      { status: 200 }
    );
  }

  // Fallback
  const data = generateMockRecommendations(context);
  return NextResponse.json({
    data,
    raw: JSON.stringify(data, null, 2),
    debug: { ...debug, response: data },
  });
}

function safeParseJson(text: string): unknown {
  if (!text) return null;
  // Try direct
  try {
    return JSON.parse(text);
  } catch {}
  // Try to extract a JSON block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  settings: Pick<AppSettings, "llm">
): Promise<{ text: string; request: unknown }> {
  if (!settings.llm.apiKey) {
    throw new Error("OpenAI API key not set in Settings.");
  }
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: settings.llm.apiKey });
  const request = {
    model: settings.llm.model || "gpt-4o-mini",
    temperature: settings.llm.temperature,
    max_tokens: settings.llm.maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" as const },
  };
  const resp = await client.chat.completions.create(request as any);
  const text = resp.choices?.[0]?.message?.content ?? "";
  return { text, request };
}

async function callAnthropic(
  systemPrompt: string,
  userMessage: string,
  settings: Pick<AppSettings, "llm">
): Promise<{ text: string; request: unknown }> {
  if (!settings.llm.apiKey) {
    throw new Error("Anthropic API key not set in Settings.");
  }
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: settings.llm.apiKey });
  const request = {
    model: settings.llm.model || "claude-haiku-4-5-20251001",
    max_tokens: settings.llm.maxTokens,
    temperature: settings.llm.temperature,
    system: systemPrompt,
    messages: [{ role: "user" as const, content: userMessage }],
  };
  const resp = await client.messages.create(request);
  const text = resp.content
    .map((c: any) => (c.type === "text" ? c.text : ""))
    .join("");
  return { text, request };
}
