import { NextRequest, NextResponse } from "next/server";
import type { AppSettings, JuniRecommendationsResponse } from "@/types";
import type { JuniRequestPayload } from "@/lib/juniClient";
import {
  buildRecommendationUserMessage,
  styleDirectives,
} from "@/lib/juniPrompts";

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

  const provider = settings.llm.provider;

  try {
    let result: { text: string; request: unknown };
    if (provider === "openai") {
      result = await callOpenAI(systemPrompt, userMessage, settings);
    } else if (provider === "anthropic") {
      result = await callAnthropic(systemPrompt, userMessage, settings);
    } else {
      return NextResponse.json(
        {
          error: `Unsupported LLM provider "${provider}". Choose anthropic or openai in Settings.`,
        },
        { status: 400 }
      );
    }

    const parsed = safeParseJson(result.text) as
      | JuniRecommendationsResponse
      | null;
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Couldn't parse the model's response as JSON. Check the recommendation prompt or try again.",
          raw: result.text,
          debug: { ...debug, request: result.request, response: result.text },
        },
        { status: 502 }
      );
    }
    return NextResponse.json({
      data: parsed,
      raw: result.text,
      debug: { ...debug, request: result.request, response: result.text },
    });
  } catch (e: any) {
    const message = e?.message ?? String(e);
    return NextResponse.json(
      {
        error: message,
        debug: { ...debug, response: { error: message } },
      },
      { status: 502 }
    );
  }
}

function safeParseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
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
  const apiKey = settings.llm.apiKey || process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not set. Add OPENAI_API_KEY to env or paste a key in Settings."
    );
  }
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
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
  const apiKey = settings.llm.apiKey || process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) {
    throw new Error(
      "Anthropic API key not set. Add ANTHROPIC_API_KEY to env or paste a key in Settings."
    );
  }
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
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
