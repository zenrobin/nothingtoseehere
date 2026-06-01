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

  const { settings, context, conversation } = payload;
  const debug = {
    request: null as unknown,
    response: null as unknown,
    context,
  };

  const systemPrompt = `${settings.prompts.system}\n\n[STYLE DIRECTIVES]\n${styleDirectives(
    settings.style
  )}`;

  let userMessage = buildRecommendationUserMessage(
    settings.prompts.recommendation,
    {
      memory: context.memory,
      photoAnalyses: context.photoAnalyses,
      existingArt: context.existingArt,
      artForms: context.artForms,
      capabilities: context.capabilities,
    }
  );

  // Enforce photoId instruction to handle stale prompts in local storage
  userMessage += `\n\n[CRITICAL INSTRUCTION]\nFor each recommendation in the "recommendations" array, you MUST pick the most relevant "photo_id" from the "PHOTO ANALYSES" list and include it as the "photoId" field (as a number, or null if none fit) in the JSON object. This is extremely important so that the selected photo matches the creative concept!`;

  // Layer conversation context onto the base prompt so the LLM can react.
  if (conversation?.userMessage?.trim()) {
    userMessage += `\n\n[USER MESSAGE]\nThe user just wrote: "${conversation.userMessage.trim()}"\n\nRespond to what they actually want. In the openingMessage, acknowledge their request specifically. Then provide 1-4 recommendations tailored to it (still grounded in this memory's specifics, but shifted in the direction they asked for). If they asked for a specific artform like "card", "movie", "print", or "book", make sure recommendations match that artform.`;
  }
  if (conversation?.excludeTitles?.length) {
    const list = conversation.excludeTitles.map((t) => `- ${t}`).join("\n");
    userMessage += `\n\n[ALREADY SHOWN — DO NOT REPEAT]\n${list}\n\nGenerate DIFFERENT ideas that don't overlap with the above.`;
  }
  if (conversation?.moreIdeas) {
    userMessage += `\n\n[CONVERSATIONAL CONTEXT]\nThis is a "More ideas" follow-up. Open with a short conversational line like "Sure — here's a different angle:" or "Here are a few more directions:" so the message reads as continuing the same chat, not a fresh start.`;
  }

  const provider = settings.llm.provider;

  try {
    let result: { text: string; request: unknown };
    if (provider === "openai") {
      result = await callOpenAI(systemPrompt, userMessage, settings);
    } else if (provider === "anthropic") {
      result = await callAnthropic(systemPrompt, userMessage, settings);
    } else if (provider === "gemini") {
      result = await callGemini(systemPrompt, userMessage, settings);
    } else {
      return NextResponse.json(
        {
          error: `Unsupported LLM provider "${provider}". Choose anthropic, openai, or gemini in Settings.`,
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

async function callGemini(
  systemPrompt: string,
  userMessage: string,
  settings: Pick<AppSettings, "llm">
): Promise<{ text: string; request: unknown }> {
  const apiKey = settings.llm.apiKey || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error(
      "Gemini API key not set. Add GEMINI_API_KEY to env or paste a key in Settings."
    );
  }

  const model = settings.llm.model || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const request = {
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: settings.llm.temperature,
      maxOutputTokens: Math.max(settings.llm.maxTokens || 1500, 8000),
      responseMimeType: "application/json",
      thinkingConfig: {
        thinkingLevel: (settings.llm.thinkingLevel || "medium").toUpperCase(),
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const resData = await response.json();
  const parts = resData.candidates?.[0]?.content?.parts ?? [];
  
  console.log("GEMINI RAW PARTS:", JSON.stringify(parts, null, 2));

  // Filter out any reasoning/thought parts to extract only the final JSON output
  const textParts = parts.filter((part: any) => !part.thought);
  const text = textParts.map((part: any) => part.text || "").join("") || 
               parts.map((part: any) => part.text || "").join("");

  console.log("GEMINI EXTRACTED TEXT:", text);

  return { text, request };
}
