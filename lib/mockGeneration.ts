import type { ArtFormKind, CreativeBrief, GenerationJob } from "@/types";

const RESULT_GRADIENTS: Record<string, string> = {
  "Quiet House Portrait": "from-paper-cream via-juni-soft to-ink-100",
  "Everyday Homecoming": "from-juni-peach/70 via-juni-rose/50 to-paper-cream",
  "Vintage Address Card": "from-juni-peach/60 via-paper-warm to-juni-rose/40",
  "Editorial Threshold": "from-ink-700/80 via-ink-500/40 to-juni-soft/30",
  "Quiet Homecoming Movie": "from-ink-700 via-juni-ink/70 to-juni-soft/30",
};

export function startGenerationJob(args: {
  memoryId: string;
  brief: CreativeBrief;
  delayMs: number;
  failureRatePct: number;
  onUpdate: (job: GenerationJob) => void;
}): { jobId: string; cancel: () => void } {
  const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const startedAt = Date.now();
  const initial: GenerationJob = {
    id: jobId,
    memoryId: args.memoryId,
    brief: args.brief,
    status: "pending",
    startedAt,
  };
  args.onUpdate(initial);

  const timer = setTimeout(() => {
    const fails = Math.random() * 100 < args.failureRatePct;
    if (fails) {
      args.onUpdate({
        ...initial,
        status: "failed",
        completedAt: Date.now(),
      });
      return;
    }
    const kind: ArtFormKind = args.brief.artform === "movie" ? "movie" : "genArt";
    args.onUpdate({
      ...initial,
      status: "complete",
      completedAt: Date.now(),
      result: {
        title: args.brief.conceptTitle,
        explanation: buildExplanation(args.brief),
        thumbGradient:
          RESULT_GRADIENTS[args.brief.conceptTitle] ??
          (kind === "movie"
            ? "from-ink-700 via-juni-ink/70 to-juni-soft/30"
            : "from-paper-cream via-juni-soft to-juni-peach/40"),
        kind,
      },
    });
  }, args.delayMs);

  return {
    jobId,
    cancel: () => clearTimeout(timer),
  };
}

function buildExplanation(brief: CreativeBrief): string {
  if (brief.artform === "movie") {
    return `I made this movie feel ${brief.tone}, so it lingers on the everyday details instead of trying to summarize the whole day.`;
  }
  if (brief.conceptTitle.toLowerCase().includes("house portrait")) {
    return "I made this one feel like a quiet house portrait, so it honors the everyday-home feeling instead of treating the photo like a generic exterior shot.";
  }
  if (brief.conceptTitle.toLowerCase().includes("address")) {
    return "I built this around the house number so the place itself becomes the keepsake.";
  }
  if (brief.conceptTitle.toLowerCase().includes("homecoming")) {
    return "I made this warmer and softer — the porch and bike become the emotional center, not the architecture.";
  }
  return `I made this feel ${brief.tone}, so it goes somewhere your other art doesn't already cover.`;
}
