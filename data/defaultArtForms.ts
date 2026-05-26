import type { ArtFormTemplate } from "@/types";

export const DEFAULT_ART_FORMS: ArtFormTemplate[] = [
  {
    id: "house-portrait",
    name: "House Portrait",
    artform: "genArt",
    bestFor: "Front doors, façades, named places",
    style: "Editorial · architectural · 8×10 print",
    rationale:
      "Treats the house like a portrait subject. Symmetric framing, low saturation, considered light — the way a magazine would shoot it.",
    placeholderGradient: "from-paper-cream via-juni-soft to-ink-100",
    tags: ["home", "portrait", "polished", "print"],
  },
  {
    id: "address-keepsake",
    name: "Address Keepsake",
    artform: "genArt",
    bestFor: "House numbers, street signs, named places",
    style: "Letterpress card · 5×7 · cream stock",
    rationale:
      "Builds the piece around the place's name or number. Heavy typography, deckled edges, reads like a small heirloom card you'd frame on a shelf.",
    placeholderGradient: "from-juni-peach/60 via-paper-warm to-juni-rose/40",
    tags: ["typography", "vintage", "place", "letterpress"],
  },
  {
    id: "everyday-editorial",
    name: "Everyday Editorial",
    artform: "genArt",
    bestFor: "Ordinary moments, quiet domestic scenes",
    style: "Saul Leiter palette · soft focus · matte finish",
    rationale:
      "Magazine-spread spacing, generous negative space, a single quiet subject. Made for moments that feel small but matter.",
    placeholderGradient: "from-ink-100 via-paper to-juni-mint/40",
    tags: ["editorial", "quiet", "everyday"],
  },
  {
    id: "warm-watercolor",
    name: "Warm Watercolor",
    artform: "genArt",
    bestFor: "Homecoming, family, sentimental moments",
    style: "Hand-painted · paper grain · warm palette",
    rationale:
      "Reads like an illustrated keepsake — soft edges, sentimental color, visible brushwork. Pairs well with a thin oak frame.",
    placeholderGradient: "from-juni-peach/70 via-juni-rose/50 to-paper-cream",
    tags: ["illustration", "warm", "keepsake"],
  },
  {
    id: "vintage-postcard",
    name: "Vintage Postcard",
    artform: "genArt",
    bestFor: "Towns, neighborhoods, addresses",
    style: "1960s travel postcard · 4×6 · stamped & creased",
    rationale:
      "Frames the memory like a postcard from itself — block-letter place name, decorative border, faux postal cancellation.",
    placeholderGradient: "from-juni-mint/60 via-paper-warm to-juni-peach/40",
    tags: ["postcard", "nostalgic", "place"],
  },
  {
    id: "quiet-movie",
    name: "Quiet Homecoming",
    artform: "movie",
    bestFor: "Slow, atmospheric memory movies",
    style: "30–60s · solo piano · sparse title cards",
    rationale:
      "Lingers on details: a railing, a number, a small box. Gentle pacing, two or three text cards, ambient piano.",
    placeholderGradient: "from-ink-700 via-juni-ink/70 to-juni-soft/30",
    tags: ["movie", "elegant", "ambient"],
  },
];
