export const DEFAULT_SYSTEM_PROMPT = `You are Juni, Mixbook's memory creative assistant.
You are not a generic chatbot and you are not a blank prompt box.
You help people create meaningful Memory Art from their own memories.
You can inspect the memory, understand what art already exists, and recommend what would be meaningful to create next.
Your job is to reduce blank-page anxiety, make creation feel personal, and help the user make a confident creative decision.
Be specific to the memory. Mention concrete details from the memory when useful.
Be opinionated but not pushy.
Ask at most one question at a time.
Prefer tappable choices, cards, and concise rationale over long chat.
Always stay within the product capabilities provided.
For GenArt, keep the default experience grounded in the memory. Raw imaginative ideas are allowed only when the user chooses that path.
For Movie, only recommend supported controls: music, pacing/timing/length, title, more or less text, elegant/joyful themes, and people/detail focus.
Do not overpromise. Do not mention internal pipeline language to the user.
Before generation, create a concise creative brief that captures artform, source memory, selected direction, tone, key details, and what should be different from existing art.`;

export const DEFAULT_RECOMMENDATION_PROMPT = `Given the following memory context, existing art, available ArtForms/templates, and capabilities, generate a set of creative recommendations for Juni.
Return JSON with:
{
  "openingMessage": "short memory-aware Juni message",
  "memoryRead": {
    "emotionalTone": [],
    "specificDetails": [],
    "alreadyCovered": [],
    "creativeOpportunities": []
  },
  "recommendations": [
    {
      "id": "string",
      "artform": "genArt or movie",
      "title": "string",
      "description": "string",
      "why": "string",
      "suggestedTemplateId": "string or null",
      "photoId": "number or null (choose the most relevant photo_id from PHOTO ANALYSES for this recommendation, or null if none fit)",
      "followupQuestion": {
        "question": "string",
        "chips": ["string"]
      }
    }
  ]
}

CRITICAL OUTPUT RULES:
- Respond with the JSON object ONLY. No preamble, no commentary, no explanation.
- Do NOT wrap the output in markdown code fences (no \`\`\`json, no \`\`\`).
- Start the response with { and end with }. Nothing else before or after.
- Keep each "description" and "why" under 300 characters so the response fits in the model's output window.`;

export function styleDirectives(style: {
  concise: number;
  proactive: number;
  magical: number;
  askMore: number;
}): string {
  const lines: string[] = [];
  lines.push(
    style.concise >= 60
      ? "Keep replies very short and punchy."
      : style.concise <= 40
      ? "It's okay to be a little more expressive when it adds emotional clarity."
      : "Be concise but not terse."
  );
  lines.push(
    style.proactive >= 60
      ? "Lead with a confident recommendation; do not wait for the user to ask."
      : style.proactive <= 40
      ? "Stay neutral and offer choices without strong steering."
      : "Be helpfully proactive but never pushy."
  );
  lines.push(
    style.magical >= 60
      ? "Lean into the magical, sensory, evocative tone."
      : style.magical <= 40
      ? "Stay practical and grounded, avoid flowery language."
      : "Balance practical clarity with a touch of warmth."
  );
  lines.push(
    style.askMore >= 60
      ? "Ask more clarifying questions, one at a time."
      : style.askMore <= 40
      ? "Minimize questions; commit to a direction quickly."
      : "Ask at most one question at a time."
  );
  return lines.join("\n");
}

export interface RecommendationContextInput {
  memory: unknown;
  photoAnalyses: unknown;
  existingArt: unknown;
  artForms: unknown;
  capabilities: unknown;
}

/**
 * Strip the memory payload down to fields the LLM actually needs.
 * The raw memory ZIP can carry a 50KB narrative-prompt.txt plus a `map`
 * field with route coordinates that just bloat the request — both blow
 * past Anthropic's 50K input-tokens-per-minute Tier-1 limit fast.
 */
function trimMemory(memory: any): any {
  if (!memory || typeof memory !== "object") return memory;
  const {
    narrativePrompt: _np,
    map: _m,
    context_captured_at: _cc,
    ...rest
  } = memory;
  return rest;
}

/**
 * Strip photo analyses to the fields that inform creative recommendations.
 * Drops image data URLs, hosted URLs, dimensions, and raw coordinates;
 * keeps the description + key elements that the LLM reads.
 */
function trimPhotoAnalyses(analyses: any): any {
  if (!Array.isArray(analyses)) return analyses;
  return analyses.map((p) => {
    if (!p || typeof p !== "object") return p;
    const loc = p.parsedLocation
      ? [p.parsedLocation.point_of_interest, p.parsedLocation.city, p.parsedLocation.country]
          .filter(Boolean)
          .join(", ")
      : undefined;
    return {
      photo_id: p.photo_id,
      description: typeof p.description === "string" ? p.description.slice(0, 400) : p.description,
      scores: p.scores,
      key_elements: p.key_elements,
      location_context: p.location_context || loc,
      time_context: p.time_context,
    };
  });
}

/**
 * Strip ArtForm templates to just what the LLM needs to pick one — name,
 * artform kind, bestFor, style. Drops gradients, tags, long rationales.
 */
function trimArtForms(forms: any): any {
  if (!Array.isArray(forms)) return forms;
  return forms.map((f) => {
    if (!f || typeof f !== "object") return f;
    return {
      id: f.id,
      name: f.name,
      artform: f.artform,
      bestFor: f.bestFor,
      style: f.style,
    };
  });
}

export function buildRecommendationUserMessage(
  recoPrompt: string,
  ctx: RecommendationContextInput
): string {
  return `${recoPrompt}

MEMORY:
${JSON.stringify(trimMemory(ctx.memory), null, 2)}

PHOTO ANALYSES:
${JSON.stringify(trimPhotoAnalyses(ctx.photoAnalyses), null, 2)}

EXISTING ART:
${JSON.stringify(ctx.existingArt, null, 2)}

AVAILABLE ARTFORMS:
${JSON.stringify(trimArtForms(ctx.artForms), null, 2)}

CAPABILITIES:
${JSON.stringify(ctx.capabilities, null, 2)}

Return only valid JSON.`;
}
