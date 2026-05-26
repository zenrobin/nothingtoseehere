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
    throw new Error(`Juni request failed: ${res.status} ${text}`);
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
      description: `A polished art print that makes ${memory.snappy_title} feel iconic and personal.`,
      why: `Honors the architectural mood of ${memory.medium_title} without making it look generic.`,
      suggestedTemplateId: pickTemplate(artForms, "house-portrait"),
      followupQuestion: {
        question:
          "Should this feel more like a polished house portrait or a personal homecoming keepsake?",
        chips: [
          "Polished house portrait",
          "Personal homecoming",
          "A little nostalgic",
          "Surprise me",
        ],
      },
    });

    recs.push({
      id: "rec-everyday-homecoming",
      artform: "genArt",
      title: "Everyday Homecoming",
      description: `A warm illustrated keepsake built around the porch${
        hasBike ? ", bike" : ""
      }${hasPackage ? ", and the waiting package" : ""}.`,
      why: "Leans into the small ordinary details — these are what'll feel like home in 10 years.",
      suggestedTemplateId: pickTemplate(artForms, "warm-watercolor"),
      followupQuestion: {
        question: "How illustrated should this feel?",
        chips: [
          "Soft watercolor",
          "Crisp illustration",
          "Painterly and loose",
          "Surprise me",
        ],
      },
    });

    if (hasHouseNumber) {
      recs.push({
        id: "rec-vintage-address-card",
        artform: "genArt",
        title: "Vintage Address Card",
        description: `A nostalgic design built around the ${memory.snappy_title} house number.`,
        why: "The number is the strongest character in the photo — gives it real keepsake weight.",
        suggestedTemplateId: pickTemplate(artForms, "address-keepsake"),
        followupQuestion: {
          question: "Which era should it evoke?",
          chips: [
            "Mid-century postcard",
            "1970s travel",
            "Modern minimalist",
            "Surprise me",
          ],
        },
      });
    }

    recs.push({
      id: "rec-editorial-threshold",
      artform: "genArt",
      title: "Editorial Threshold",
      description: `A moody magazine-style artwork about the feeling of arriving home${
        hasOvercast ? " under an overcast sky" : ""
      }.`,
      why: "Builds on your existing 'Threshold' keepsake but goes more cinematic, less domestic.",
      suggestedTemplateId: pickTemplate(artForms, "everyday-editorial"),
      followupQuestion: {
        question: "How cinematic do you want this?",
        chips: [
          "Quiet and editorial",
          "Moody and dramatic",
          "Warm and soft",
          "Surprise me",
        ],
      },
    });
  }

  if (allowedArtforms.has("movie")) {
    recs.push({
      id: "rec-quiet-homecoming-movie",
      artform: "movie",
      title: "Quiet Homecoming Movie",
      description:
        "A slow, elegant memory movie around the porch and the feeling of arriving home.",
      why: "You don't have a movie that lingers on the everyday details yet.",
      suggestedTemplateId: pickTemplate(artForms, "quiet-movie"),
      followupQuestion: {
        question: "Should the movie be shorter and warmer, or longer and elegant?",
        chips: [
          "Shorter & warmer",
          "Longer & elegant",
          "Elegant with less text",
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
      ? `"${memory.snappy_title}" is such a quiet, specific memory — the steps, the bike, that little box on the porch.`
      : `"${memory.snappy_title}" — there's something specific in this memory I want to honor.`;
  if (has) {
    return `${lead} You already made a soft keepsake and an elegant movie, so I want to recommend something that goes somewhere different.`;
  }
  return `${lead} Here are a few directions I think would feel meaningful.`;
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
  const summary =
    rec.artform === "movie"
      ? `I'll make a ${tone} movie around ${memory.snappy_title}, focused on ${keyDetails
          .slice(0, 2)
          .join(", ")}. ${
          movieControls
            ? `Theme: ${movieControls.theme}, length: ${movieControls.length}, text: ${movieControls.textDensity}, featuring ${movieControls.feature}.`
            : ""
        }`
      : `I'll create a ${tone} ${template?.name.toLowerCase() ?? "art piece"} of ${
          memory.snappy_title
        }, using ${keyDetails.slice(0, 3).join(", ")}. It should feel ${tone}, personal, and a little nostalgic — more like a keepsake than a literal photo.`;

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
