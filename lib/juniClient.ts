import type {
  AppSettings,
  ArtFormTemplate,
  ExistingArt,
  JuniRecommendation,
  JuniRecommendationsResponse,
  Memory,
  PhotoAnalysis,
} from "@/types";
import {
  buildRecommendationUserMessage,
  styleDirectives,
} from "@/lib/juniPrompts";

export interface JuniContext {
  memory: Memory;
  photoAnalyses: PhotoAnalysis[];
  existingArt: ExistingArt[];
  artForms: ArtFormTemplate[];
  capabilities: AppSettings["capabilities"];
}

export interface JuniRequestPayload {
  settings: Pick<AppSettings, "llm" | "prompts" | "style" | "capabilities">;
  context: JuniContext;
}

export async function fetchRecommendations(
  payload: JuniRequestPayload
): Promise<{
  data: JuniRecommendationsResponse;
  raw: string;
  debug: {
    request: unknown;
    response: unknown;
    context: unknown;
  };
}> {
  const res = await fetch("/api/juni", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = `Juni request failed (${res.status})`;
    try {
      const body = JSON.parse(text);
      if (typeof body?.error === "string" && body.error.trim()) {
        message = body.error;
      }
    } catch {
      if (text.trim()) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

// === Mock LLM ===

export function generateMockRecommendations(
  ctx: JuniContext
): JuniRecommendationsResponse {
  const { memory, photoAnalyses, artForms, capabilities } = ctx;

  const allowedArtforms = new Set<"genArt" | "movie">();
  if (capabilities.genArt) allowedArtforms.add("genArt");
  if (capabilities.movie) allowedArtforms.add("movie");

  const photoDescription = photoAnalyses[0]?.description ?? "";
  const hasHouseNumber =
    /twenty\s?4|number/i.test(photoDescription) ||
    /address/i.test(photoDescription);
  const hasBike = /bicycle|bike/i.test(photoDescription);
  const hasPackage = /box|package|delivery/i.test(photoDescription);
  const hasOvercast = /overcast|cloudy|gray/i.test(photoDescription);

  const recs: JuniRecommendation[] = [];

  if (allowedArtforms.has("genArt")) {
    recs.push({
      id: "rec-quiet-house-portrait",
      artform: "genArt",
      title: "Quiet House Portrait",
      description: `An 8×10 editorial print of the front entrance — centered on the door, evergreens framing it, overcast light kept soft.`,
      why: `Your existing 'Threshold' is warm and small. A clean architectural portrait is the thing that's missing — the one you'd hang in the entryway.`,
      suggestedTemplateId: pickTemplate(artForms, "house-portrait"),
      followupQuestion: {
        question:
          "Crop tight on the door, or pull back to include the steps and shrubs?",
        chips: [
          "Tight on the door",
          "Pulled back, full façade",
          "Symmetrical, head-on",
          "Surprise me",
        ],
      },
    });

    recs.push({
      id: "rec-everyday-homecoming",
      artform: "genArt",
      title: "Everyday Homecoming",
      description: `A warm 5×7 watercolor — porch${
        hasBike ? ", the bike leaning on the railing" : ""
      }${hasPackage ? ", the little brown box waiting" : ""}. Soft edges, visible brush.`,
      why: "The bike and box are the most ordinary, most specific details — and the ones most likely to be gone in two years. Watercolor freezes them without making them precious.",
      suggestedTemplateId: pickTemplate(artForms, "warm-watercolor"),
      followupQuestion: {
        question: "How loose should the painting feel?",
        chips: [
          "Crisp, almost illustrated",
          "Loose & painterly",
          "Wet-on-wet, dreamy",
          "Surprise me",
        ],
      },
    });

    if (hasHouseNumber) {
      recs.push({
        id: "rec-vintage-address-card",
        artform: "genArt",
        title: "TWENTY 4",
        description: `A 5×7 letterpress card — 'TWENTY 4' set in heavy serifs across cream stock, the porch architecture as a faint underlayer.`,
        why: `The silver numbers are the strongest character in this photo. Building the piece around them turns "the house" into "this house" — yours, specifically.`,
        suggestedTemplateId: pickTemplate(artForms, "address-keepsake"),
        followupQuestion: {
          question: "Which typographic mood?",
          chips: [
            "Heavy serif, classic",
            "Mid-century postcard",
            "Modern sans, minimal",
            "Surprise me",
          ],
        },
      });
    }

    recs.push({
      id: "rec-editorial-threshold",
      artform: "genArt",
      title: "Late Afternoon, Wellesley",
      description: `A moody magazine-style 11×14 print${
        hasOvercast ? " — overcast sky, low-contrast light, leaves on the path" : ""
      }. Reads like a feature opener.`,
      why: "Your 'Threshold' keepsake honors the feeling. This honors the place — same memory, different register, sits well next to it on a wall.",
      suggestedTemplateId: pickTemplate(artForms, "everyday-editorial"),
      followupQuestion: {
        question: "Where should the eye land?",
        chips: [
          "On the door",
          "On the bike",
          "On the path & leaves",
          "Surprise me",
        ],
      },
    });
  }

  if (allowedArtforms.has("movie")) {
    recs.push({
      id: "rec-quiet-homecoming-movie",
      artform: "movie",
      title: "Coming Home, Slow",
      description:
        "A 30-second movie — three details, three title cards: the steps, the bike, the package. Solo piano under it.",
      why: "Your 'Front Steps' movie is the wide shot. This is the close-up — same memory, but it slows the moment down instead of summarizing it.",
      suggestedTemplateId: pickTemplate(artForms, "quiet-movie"),
      followupQuestion: {
        question: "Tighter and warmer, or longer and more elegant?",
        chips: [
          "30s, warm & close",
          "60s, elegant & wide",
          "Less text, more music",
          "Surprise me",
        ],
      },
    });
  }

  const opening = buildOpeningMessage(memory, ctx.existingArt);
  return {
    openingMessage: opening,
    memoryRead: {
      emotionalTone: [memory.emotional_tone, "homecoming", "everyday"],
      specificDetails: photoAnalyses[0]?.key_elements?.slice(0, 5) ?? [
        "front steps",
        "porch",
      ],
      alreadyCovered: ctx.existingArt.map((a) => `${a.kind}: ${a.title}`),
      creativeOpportunities: [
        "lean into the house number as a keepsake",
        "an editorial print that honors the everyday",
        "a slow movie that lets the moment breathe",
      ],
    },
    recommendations: recs.slice(0, 4),
  };
}

function pickTemplate(forms: ArtFormTemplate[], id: string): string | null {
  return forms.find((f) => f.id === id)?.id ?? null;
}

function buildOpeningMessage(memory: Memory, art: ExistingArt[]): string {
  const has = art.length > 0;
  const lead =
    memory.snappy_title === "Home 24"
      ? `"${memory.snappy_title}" — that overcast afternoon at the porch, with the bike and the little box waiting.`
      : `"${memory.snappy_title}" — I want to honor what's specific here, not just decorate the photo.`;
  if (has) {
    const kinds = art.map((a) => a.kind);
    const hasGen = kinds.includes("genArt");
    const hasMovie = kinds.includes("movie");
    const summary =
      hasGen && hasMovie
        ? "You already made a soft keepsake and a quiet movie, so let me push somewhere those don't go."
        : hasGen
        ? "You already made a soft keepsake — let me try something different in register."
        : "You already made a movie — let me push toward something printable and lasting.";
    return `${lead} ${summary}`;
  }
  return `${lead} Here are four directions I'd actually pick for this memory.`;
}

// === Creative brief mock ===

import type { CreativeBrief, JuniRecommendation as Rec, MovieControls } from "@/types";

export function buildMockBrief(args: {
  memory: Memory;
  rec: Rec;
  artForms: ArtFormTemplate[];
  followupAnswer: string;
  movieControls?: MovieControls;
}): CreativeBrief {
  const { memory, rec, artForms, followupAnswer, movieControls } = args;
  const template = artForms.find((t) => t.id === rec.suggestedTemplateId);
  const tone = inferTone(followupAnswer);
  const keyDetails = inferKeyDetails(memory);
  const differentiator =
    rec.artform === "movie"
      ? "Slower, more atmospheric than your existing movie — leans into the everyday."
      : "Goes beyond the literal photo — treats the everyday as something worth honoring.";
  const format =
    template?.style?.split("·")[1]?.trim() ||
    template?.style?.split("·")[2]?.trim() ||
    (rec.artform === "movie" ? "30 second movie" : "8×10 print");
  const styleHint = template?.style || "";
  const summary =
    rec.artform === "movie"
      ? `A ${movieControls?.length === "longer" ? "60-second" : "30-second"} ${tone} movie around "${memory.snappy_title}". ${
          keyDetails.slice(0, 2).join(", ")
        }, then a quiet hold on the door. ${
          movieControls
            ? `${capFirst(movieControls.theme)} theme, ${movieControls.textDensity === "less" ? "minimal text" : "more text"}, featuring ${movieControls.feature.toLowerCase()}.`
            : ""
        }`.trim()
      : `A ${tone} ${template?.name.toLowerCase() ?? "piece"} of "${memory.snappy_title}" — ${format}. Built around ${keyDetails
          .slice(0, 3)
          .join(", ")}. ${styleHint ? `Style: ${styleHint}.` : ""} Different from your existing art: ${differentiator.toLowerCase()}`.trim();

  return {
    artform: rec.artform,
    sourceMemoryId: memory.id,
    conceptId: rec.id,
    conceptTitle: rec.title,
    templateId: template?.id ?? null,
    templateName: template?.name ?? null,
    tone,
    keyDetails,
    differentiator,
    summary,
    movieControls,
  };
}

function capFirst(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function inferTone(answer: string): string {
  const a = answer.toLowerCase();
  if (a.includes("polished")) return "quiet and polished";
  if (a.includes("nostalgic")) return "softly nostalgic";
  if (a.includes("homecoming") || a.includes("personal")) return "personal and warm";
  if (a.includes("moody") || a.includes("dramatic")) return "moody and cinematic";
  if (a.includes("watercolor") || a.includes("soft")) return "soft and illustrated";
  if (a.includes("elegant")) return "elegant and slow";
  if (a.includes("warm")) return "warm";
  if (a.includes("postcard") || a.includes("mid-century")) return "vintage and playful";
  return "quiet and personal";
}

function inferKeyDetails(memory: Memory): string[] {
  return [
    "the concrete front steps",
    "the black bicycle on the railing",
    "the small package on the porch",
    "the overcast late-afternoon light",
    `the "${memory.snappy_title}" house number`,
  ];
}
