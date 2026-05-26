import type { ExistingArt, Memory, PhotoAnalysis } from "@/types";

export const DEFAULT_MEMORY: Memory = {
  id: "memory-episode-19607",
  one_word_title: "Threshold",
  snappy_title: "Home 24",
  medium_title: "Twenty 4 Porch",
  detailed_title: "Wellesley House Entrance",
  descriptive_title: "Home Snapshot in Wellesley",
  memory_summary:
    "A serene late-afternoon glimpse of the home entrance at Twenty 4 in Wellesley, featuring the porch steps, bicycle, delivery box, and surrounding shrubs under an overcast sky.",
  memory_narrative:
    "I pause at the base of the concrete steps leading to our house at Twenty 4, noting the black bicycle leaning against the railing and the small brown box waiting on the porch. The white door gleams under the covered entrance, framed by evergreen shrubs and bare autumn trees.",
  editorial_intro:
    "That familiar crunch of leaves underfoot as I approach Twenty 4—the silver numbers catching the dim late-afternoon light, the bike slouched casually by the rail, a lone box promising some small surprise. In this quiet suburban frame, every detail etches the essence of homecoming, where ordinary thresholds hold the day's unspoken stories.",
  score: 35,
  emotional_tone: "sensory_and_embodied",
  cover_photo_id: 2636398069,
  categories: [
    {
      main: "Everyday Life",
      subcategories: ["Routine Moments", "Household Activities"],
      relevance: 1,
    },
  ],
  timeline: [
    {
      time: "Late afternoon",
      event:
        "Standing before the entrance to the house at Twenty 4, with steps, bike, delivery box, shrubs, and overcast skies.",
      photo_ids: [2636398069],
      timestamp: "2026-04-06T16:30:24Z",
      location: "Wellesley",
    },
  ],
};

export const DEFAULT_PHOTO_ANALYSES: PhotoAnalysis[] = [
  {
    photo_id: 2636398069,
    description:
      "The image depicts the exterior of a two-story house with light gray horizontal siding on the left side and crisp white vertical paneling on the right around the entrance. A covered porch with white columns and recessed lighting panels overhead shelters a white front door with a brass handle and doorbell. To the left of the door, a prominent silver house number sign reads 'TWENTY 4'. A black lantern-style wall light is mounted beside the door. Leading up to the porch are five concrete steps with modern black metal railings featuring horizontal bars. At the top of the steps sits a small brown cardboard box. Nearby, a black bicycle with red accents leans against the railing. Evergreen shrubs, likely boxwoods, flank the right side of the steps, with some fallen leaves scattered around. The ground cover includes patchy grass, dirt, and more shrubs on the left. A concrete or stone paver pathway extends from the base of the steps. Bare trees with autumn foliage and some bare branches are visible in the background against an overcast sky, suggesting late fall or early winter conditions. The scene is well-composed with good depth from foreground shrubs to background trees.",
    scores: { aesthetic: 8, emotional: 6, memory_value: 7 },
    key_elements: [
      "location: residential house exterior",
      "house number: Twenty 4",
      "objects: white door, black lantern, black metal railings, brown cardboard box, black bicycle",
      "plants: evergreen shrubs, bare trees",
      "pathway: stone pavers",
    ],
    location_context:
      "This image appears to be taken at a suburban residential house entrance near coordinates 42.324525, -71.264288, likely in the Boston area.",
    time_context:
      "Late afternoon (16:30 timestamp) in late fall or early winter, overcast daylight with bare trees",
  },
];

export const DEFAULT_EXISTING_ART: ExistingArt[] = [
  {
    id: "art-genart-threshold",
    memoryId: "memory-episode-19607",
    kind: "genArt",
    title: "Threshold",
    subtitle: "8×10 framed print · Apr 8",
    thumbColor: "from-juni-soft via-juni-peach/40 to-juni-rose/30",
    iconHint: "house",
    createdAt: "2026-04-08T10:00:00Z",
  },
  {
    id: "art-movie-front-steps",
    memoryId: "memory-episode-19607",
    kind: "movie",
    title: "The Front Steps",
    subtitle: "0:42 movie · elegant · piano",
    thumbColor: "from-ink-700 via-ink-500/60 to-juni-soft/40",
    iconHint: "play",
    createdAt: "2026-04-08T10:05:00Z",
  },
];
