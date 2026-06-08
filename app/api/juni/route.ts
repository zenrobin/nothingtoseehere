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
  if (conversation?.ideaChat) {
    const history = (conversation.messageHistory ?? [])
      .map((m) => `${m.role === "juni" ? "Juni" : "User"}: ${m.content}`)
      .join("\n");
    userMessage += `\n\n[IDEA CHAT MODE]\nThe user opened "Start with an Idea" — they don't have a specific memory in mind. You are having a short back-and-forth to converge on a creation. Your reply is a single conversational "openingMessage" sentence (under 25 words) that asks ONE clarifying question OR commits to a direction. Only populate "recommendations" with 1-3 entries once you have enough signal to commit; otherwise leave it as []. Suggested media types: photo book, GenArt, movie, magazine.\n\n[CONVERSATION HISTORY]\n${history || "(none yet)"}`;
  }
  if (conversation?.photoFirst) {
    userMessage += `\n\n[PHOTO-FIRST MODE]\nThe user picked photos with no specific memory in mind. Read the PHOTO ANALYSES as the only context (treat MEMORY as scaffolding). In openingMessage, name what you actually see across the photos in one sentence. Then provide 2-4 recommendations tailored to those photos, leaning toward photo books and magazine spreads when there are many photos.`;
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
  // Strip markdown code fences (```json ... ```) Claude sometimes wraps in.
  let cleaned = text.replace(/```\s*json\s*/gi, "").replace(/```/g, "").trim();
  // Drop any preamble like "Here's the JSON:" before the first brace.
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);

  try {
    return JSON.parse(cleaned);
  } catch {}

  // Try the largest matching {...} block.
  const greedy = cleaned.match(/\{[\s\S]*\}/);
  if (greedy) {
    try {
      return JSON.parse(greedy[0]);
    } catch {}
  }

  // Last resort: the response may be truncated by max_tokens mid-string.
  // Shrink from the end one closing brace at a time and retry.
  const start = cleaned.indexOf("{");
  if (start !== -1) {
    for (let end = cleaned.length; end > start; end--) {
      if (cleaned[end - 1] !== "}") continue;
      try {
        return JSON.parse(cleaned.slice(start, end));
      } catch {}
    }
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
    // Recommendation payloads can run 700-1500 output tokens; bump the
    // default so the JSON doesn't get cut mid-string and fail parsing.
    max_tokens: Math.max(settings.llm.maxTokens || 0, 3000),
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
