# Juni Agent for Create From Scratch — Prototype

Internal Mixbook prototype. Mobile-first Next.js + Tailwind app for testing
whether a memory-aware creative assistant ("Juni") makes Create From Scratch
feel more inspiring, personal, low-stress, and creatively intelligent than a
standard picker UI.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The viewport is sized for an iPhone-shaped frame.

## Deploy to Vercel

Push and connect the repo to Vercel. Add this env var in Vercel's project
settings to get the live Anthropic-backed Juni experience:

- `ANTHROPIC_API_KEY` — your Anthropic API key
- `OPENAI_API_KEY` — (optional) for the OpenAI provider

The frontend hits `/api/config` on load; if the server has an Anthropic key,
the LLM provider auto-defaults to `anthropic`. If not, it falls back to
`mock` mode and the prototype still works end-to-end without any keys.

In `/settings` you can override the provider, model, or paste a per-browser
API key (which takes precedence over the env var).

## Sample memory

The prototype ships with the `memory-episode-19607` sample memory (the "Home 24"
Wellesley porch). You can upload a different `memory-episode-*.zip` via the
upload icon on the Memory Detail screen — it parses memory JSON, photo
analyses, and any embedded images. Missing photos fall back to placeholder
cards derived from the analysis descriptions.

## Flows

- **Memory Detail** — title, editorial intro, existing Memory Art, media grid.
- **Juni Sheet** — opens on `Create Artwork +`; memory-aware recommendations,
  ArtForm carousel, one adaptive follow-up question, creative brief.
- **GenArt path** — recommendation → followup → brief → 8s mocked generation
  → inline pending card → result detail.
- **Movie path** — only supported controls (theme, length, text, feature).
- **Gallery** — collection view; starting from gallery, Juni asks
  "What should we start from?" before routing to the memory flow.
- **Settings** (`/settings`) — LLM, prompts, style sliders, capabilities,
  generation delay, ArtForm catalog editor, memory JSON editor, debug panel.

## Architecture notes

- `app/page.tsx` orchestrates state and screens; `lib/store.ts` is a Zustand
  store persisted to localStorage.
- `app/api/juni/route.ts` is the LLM endpoint — supports mock, OpenAI, and
  Anthropic. JSON parsing failures fall back to mock recommendations so the
  UI stays usable.
- `lib/zipMemoryParser.ts` parses ZIPs client-side via JSZip.
- `lib/mockGeneration.ts` simulates generation with a configurable delay and
  failure rate.

This is a prototype: no real generation, no auth, no backend.
