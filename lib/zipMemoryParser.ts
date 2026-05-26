import JSZip from "jszip";
import type { Memory, PhotoAnalysis } from "@/types";

export interface ParsedMemoryZip {
  memory: Memory;
  photoAnalyses: PhotoAnalysis[];
  narrativePrompt?: string;
}

export async function parseMemoryZip(file: File | Blob): Promise<ParsedMemoryZip> {
  const zip = await JSZip.loadAsync(file);

  let memory: Memory | null = null;
  const photoAnalyses: PhotoAnalysis[] = [];
  let narrativePrompt: string | undefined;

  const imageBlobs: Record<string, string> = {};
  const fileEntries = Object.values(zip.files);

  // First pass: collect images
  for (const entry of fileEntries) {
    if (entry.dir) continue;
    const name = entry.name.toLowerCase();
    if (/\.(jpe?g|png|webp|heic|gif)$/.test(name)) {
      const blob = await entry.async("blob");
      const dataUrl = await blobToDataUrl(blob);
      const base = entry.name.split("/").pop() || entry.name;
      imageBlobs[base] = dataUrl;
      // Allow lookup by photo id substring as well
      const idMatch = base.match(/(\d{4,})/);
      if (idMatch) imageBlobs[idMatch[1]] = dataUrl;
    }
  }

  // Second pass: JSON & text
  for (const entry of fileEntries) {
    if (entry.dir) continue;
    const name = entry.name.toLowerCase();
    const base = entry.name.split("/").pop() || entry.name;

    if (/memory-episode-.*\.json$/.test(name) && !/analysis/.test(name)) {
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
    } else if (/analysis\.json$/.test(name)) {
      const text = await entry.async("text");
      try {
        const parsed = JSON.parse(text);
        const idMatch = base.match(/photo-(\d+)/);
        const photoId = idMatch ? Number(idMatch[1]) : Number(parsed.photo_id) || 0;
        const photo: PhotoAnalysis = {
          photo_id: photoId,
          description: parsed.description ?? "",
          scores: parsed.scores ?? { aesthetic: 0, emotional: 0, memory_value: 0 },
          key_elements: parsed.key_elements ?? [],
          location_context: parsed.location_context ?? "",
          time_context: parsed.time_context ?? "",
          imageDataUrl: imageBlobs[String(photoId)] || undefined,
        };
        photoAnalyses.push(photo);
      } catch (e) {
        console.error("Failed to parse analysis JSON", e);
      }
    } else if (/narrative-prompt\.txt$/.test(name)) {
      narrativePrompt = await entry.async("text");
    }
  }

  if (!memory) {
    throw new Error("No memory-episode-*.json found in ZIP");
  }

  if (narrativePrompt) memory.narrativePrompt = narrativePrompt;

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
