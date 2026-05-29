import JSZip from "jszip";
import type { Memory, PhotoAnalysis } from "@/types";

export interface ParsedMemoryZip {
  memory: Memory;
  photoAnalyses: PhotoAnalysis[];
  narrativePrompt?: string;
}

interface PhotoMeta {
  id: number;
  url?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  latitude?: number;
  longitude?: number;
  parsed_location?: {
    city?: string | null;
    country?: string | null;
    point_of_interest?: string | null;
  };
}

export async function parseMemoryZip(file: File | Blob): Promise<ParsedMemoryZip> {
  const zip = await JSZip.loadAsync(file);

  let memory: Memory | null = null;
  let narrativePrompt: string | undefined;
  let photoMetas: PhotoMeta[] = [];
  const analysesById = new Map<number, PhotoAnalysis>();
  const localImageById: Record<string, string> = {};

  const fileEntries = Object.values(zip.files);

  // Pass 1: harvest embedded images (older ZIPs) by photo_id digit substring.
  for (const entry of fileEntries) {
    if (entry.dir) continue;
    const name = entry.name.toLowerCase();
    if (/\.(jpe?g|png|webp|heic|gif)$/.test(name)) {
      const blob = await entry.async("blob");
      const dataUrl = await blobToDataUrl(blob);
      const base = entry.name.split("/").pop() || entry.name;
      const idMatch = base.match(/(\d{4,})/);
      if (idMatch) localImageById[idMatch[1]] = dataUrl;
    }
  }

  // Pass 2: JSON & text. Use precise filename matches because the new schema
  // ships *-photos.json and *-videos.json next to the memory itself.
  for (const entry of fileEntries) {
    if (entry.dir) continue;
    const base = entry.name.split("/").pop() || entry.name;
    const lowerBase = base.toLowerCase();
    const lowerPath = entry.name.toLowerCase();

    if (/^memory-episode-\d+\.json$/i.test(base)) {
      const text = await entry.async("text");
      try {
        const parsed = JSON.parse(text);
        memory = {
          id: parsed.id || base.replace(/\.json$/i, ""),
          ...parsed,
        } as Memory;
      } catch (e) {
        console.error("Failed to parse memory JSON", e);
      }
    } else if (/^memory-episode-\d+-photos\.json$/i.test(base)) {
      const text = await entry.async("text");
      try {
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) photoMetas = arr as PhotoMeta[];
      } catch (e) {
        console.error("Failed to parse photos metadata", e);
      }
    } else if (
      // Per-photo analysis lives in the photos subdirectory.
      /\/photo-\d+-analysis\.json$/i.test(lowerPath) ||
      // Older ZIPs put it at the root with the same basename pattern.
      /^photo-\d+-analysis\.json$/i.test(lowerBase)
    ) {
      const text = await entry.async("text");
      try {
        const parsed = JSON.parse(text);
        const idMatch = base.match(/photo-(\d+)/i);
        const photoId = idMatch ? Number(idMatch[1]) : Number(parsed.photo_id) || 0;
        if (!photoId) continue;
        analysesById.set(photoId, {
          photo_id: photoId,
          description: parsed.description ?? "",
          scores:
            parsed.scores ?? { aesthetic: 0, emotional: 0, memory_value: 0 },
          key_elements: parsed.key_elements ?? [],
          location_context: parsed.location_context ?? "",
          time_context: parsed.time_context ?? "",
          imageDataUrl: localImageById[String(photoId)] || undefined,
        });
      } catch (e) {
        console.error("Failed to parse analysis JSON", e);
      }
    } else if (/narrative-prompt\.txt$/i.test(lowerBase)) {
      narrativePrompt = await entry.async("text");
    }
    // Videos analysis & videos.json are parsed-aware but unused in the UI
    // for now; intentionally skipped.
  }

  if (!memory) {
    throw new Error("No memory-episode-*.json found in ZIP");
  }
  if (narrativePrompt) memory.narrativePrompt = narrativePrompt;

  // Merge per-photo metadata (url / thumbnail_url / location) into the
  // analyses and synthesise placeholder analyses for photos that have
  // metadata but no analysis file.
  for (const meta of photoMetas) {
    if (!meta?.id) continue;
    const existing = analysesById.get(meta.id);
    const thumb = meta.thumbnail_url ?? meta.url;
    const merged: PhotoAnalysis = existing
      ? { ...existing }
      : {
          photo_id: meta.id,
          description: "",
          scores: { aesthetic: 0, emotional: 0, memory_value: 0 },
          key_elements: [],
          location_context: "",
          time_context: "",
        };
    // Prefer a locally-uploaded image over the remote URL when both exist.
    if (!merged.imageDataUrl) merged.imageDataUrl = thumb || undefined;
    merged.thumbnailUrl = meta.thumbnail_url;
    merged.width = meta.width;
    merged.height = meta.height;
    merged.latitude = meta.latitude;
    merged.longitude = meta.longitude;
    merged.parsedLocation = meta.parsed_location;
    if (!merged.location_context && meta.parsed_location) {
      const { point_of_interest, city, country } = meta.parsed_location;
      merged.location_context = [point_of_interest, city, country]
        .filter(Boolean)
        .join(", ");
    }
    analysesById.set(meta.id, merged);
  }

  // Preserve the order from photos.json (which mirrors the memory's order).
  const orderedIds = photoMetas.length
    ? [
        ...photoMetas.map((m) => m.id),
        ...Array.from(analysesById.keys()).filter(
          (id) => !photoMetas.some((m) => m.id === id)
        ),
      ]
    : Array.from(analysesById.keys());
  const photoAnalyses = orderedIds
    .map((id) => analysesById.get(id))
    .filter((a): a is PhotoAnalysis => !!a);

  return { memory, photoAnalyses, narrativePrompt };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
