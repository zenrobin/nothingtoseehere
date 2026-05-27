import type { ArtFormKind } from "@/types";

type Kind = ArtFormKind | "movie" | "genArt";

function isMovie(k: Kind): boolean {
  return k === "movie";
}

/**
 * Subtle artform-coded placeholder backgrounds. Navy for Movie, deep
 * terracotta for GenArt (and other still-image kinds). Returned as inline
 * styles so they survive Tailwind purging.
 */
export function placeholderStyle(kind: Kind): React.CSSProperties {
  if (isMovie(kind)) {
    // Subtle dark navy gradient.
    return {
      backgroundImage:
        "linear-gradient(135deg, #1e293b 0%, #1e3a8a 55%, #1e1b4b 100%)",
    };
  }
  // Subtle dark terracotta / burnt-orange gradient.
  return {
    backgroundImage:
      "linear-gradient(135deg, #7c2d12 0%, #9a3412 55%, #450a0a 100%)",
  };
}

/**
 * Color tint to lay over a backdrop photo so the artform code still reads.
 * Lower opacity than the solid placeholder.
 */
export function placeholderTintStyle(kind: Kind): React.CSSProperties {
  if (isMovie(kind)) {
    return {
      backgroundImage:
        "linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(30,58,138,0.55) 55%, rgba(30,27,75,0.75) 100%)",
    };
  }
  return {
    backgroundImage:
      "linear-gradient(135deg, rgba(124,45,18,0.7) 0%, rgba(154,52,18,0.55) 55%, rgba(69,10,10,0.7) 100%)",
  };
}
