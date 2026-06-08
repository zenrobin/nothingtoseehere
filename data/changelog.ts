export interface ChangelogEntry {
  who: string;
  what: string;
  when: string; // ISO timestamp
}

/**
 * Hand-maintained changelog displayed on the Setup screen, just below the
 * Memory ZIP picker. Most-recent-first.
 *
 * To add an entry, prepend to the array. Keep the `what` line one sentence.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    who: "Robin",
    what: "Added a hamburger menu (Home / Memories / Memory Art / Themes / Projects / Account / Help) and wired the gallery back in.",
    when: "2026-06-08T18:00:00Z",
  },
  {
    who: "Robin",
    what: "Merged DavidTest into main — promotes the continuous-chat Juni and the floating-action hero design as the v1 prototype.",
    when: "2026-06-08T17:55:00Z",
  },
  {
    who: "Robin",
    what: "Fixed the second LLM call on Create Artwork — startCreate was wiping the prefetched recommendations.",
    when: "2026-06-08T17:45:00Z",
  },
  {
    who: "Robin",
    what: "Slimmed Juni's per-call payload (top 30 photos, 200-char descriptions) and added a debug log for diagnosing LLM latency.",
    when: "2026-06-08T17:20:00Z",
  },
  {
    who: "Robin",
    what: "Hardened JSON parsing of Claude responses (strips markdown fences, salvages truncated JSON) and bumped max_tokens to 3000.",
    when: "2026-06-08T17:05:00Z",
  },
  {
    who: "Robin",
    what: "Disabled mock LLM mode — prototype is Anthropic-only now and surfaces real errors when no key is set.",
    when: "2026-06-08T16:30:00Z",
  },
  {
    who: "David",
    what: "Continuous chat experience — Juni stays open with new responses instead of closing between recommendations.",
    when: "2026-06-01T07:00:00Z",
  },
  {
    who: "David",
    what: "Premium hero redesign on the Memory Detail screen, plus consistent button styles across components.",
    when: "2026-06-01T10:24:00Z",
  },
];
