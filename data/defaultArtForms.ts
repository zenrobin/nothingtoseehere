import type { ArtFormTemplate } from "@/types";

export const DEFAULT_ART_FORMS: ArtFormTemplate[] = [
  {
    id: "house-portrait",
    name: "House Portrait",
    artform: "genArt",
    bestFor: "Iconic exterior shots, doorways, homes",
    style: "Polished, editorial, architectural",
    rationale:
      "Treats the house like a portrait subject — clean composition, rich tones, considered framing.",
    placeholderGradient: "from-paper-cream via-juni-soft to-ink-100",
    tags: ["home", "portrait", "polished"],
  },
  {
    id: "address-keepsake",
    name: "Address Keepsake",
    artform: "genArt",
    bestFor: "House numbers, street signs, named places",
    style: "Vintage typographic, postcard mood",
    rationale:
      "Builds the piece around the place's name or number, like a small heirloom card.",
    placeholderGradient: "from-juni-peach/60 via-paper-warm to-juni-rose/40",
    tags: ["typography", "vintage", "place"],
  },
  {
    id: "everyday-editorial",
    name: "Everyday Editorial",
    artform: "genArt",
    bestFor: "Ordinary moments worth noticing",
    style: "Quiet magazine-style spread",
    rationale:
      "Honors small everyday details — frames them with editorial weight and breathing room.",
    placeholderGradient: "from-ink-100 via-paper to-juni-mint/40",
    tags: ["editorial", "quiet", "everyday"],
  },
  {
    id: "warm-watercolor",
    name: "Warm Watercolor",
    artform: "genArt",
    bestFor: "Homecoming, family, soft sentiment",
    style: "Illustrated, painterly, warm",
    rationale:
      "Reads like an illustrated keepsake — soft edges, sentimental color, hand-feel.",
    placeholderGradient: "from-juni-peach/70 via-juni-rose/50 to-paper-cream",
    tags: ["illustration", "warm", "keepsake"],
  },
  {
    id: "vintage-postcard",
    name: "Vintage Postcard",
    artform: "genArt",
    bestFor: "Place-based memories, addresses, towns",
    style: "Mid-century postcard, stamped, mailed",
    rationale:
      "Frames the memory like a postcard from itself — playful, place-specific, nostalgic.",
    placeholderGradient: "from-juni-mint/60 via-paper-warm to-juni-peach/40",
    tags: ["postcard", "nostalgic", "place"],
  },
  {
    id: "quiet-movie",
    name: "Quiet Homecoming",
    artform: "movie",
    bestFor: "Slow, atmospheric memory movies",
    style: "Elegant pacing, ambient soundtrack",
    rationale:
      "Lets the memory breathe — gentle pacing, sparse text, ambient feel.",
    placeholderGradient: "from-ink-700 via-juni-ink/70 to-juni-soft/30",
    tags: ["movie", "elegant", "ambient"],
  },
];
