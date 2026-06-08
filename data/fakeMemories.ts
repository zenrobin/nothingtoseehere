export interface FakeMemoryEntry {
  id: string;
  snappy_title: string;
  medium_title: string;
  date: string; // human readable
  location: string;
  photoCount: number;
  gradient: string; // tailwind classes used in MemoryCard placeholder
}

/**
 * 20 fake memory entries shown alongside the user's loaded memory in the
 * "Start with a Memory" gallery flow. All disabled — selecting one shows
 * a "coming soon" toast. Replace with real memories later.
 */
export const FAKE_MEMORIES: FakeMemoryEntry[] = [
  { id: "f1", snappy_title: "Cape Light", medium_title: "Provincetown weekend", date: "Last weekend", location: "Provincetown, MA", photoCount: 42, gradient: "from-juni-peach to-juni-rose" },
  { id: "f2", snappy_title: "Ezra at 7", medium_title: "Birthday afternoon", date: "Mar 14", location: "Brookline, MA", photoCount: 81, gradient: "from-juni-mint to-juni-soft" },
  { id: "f3", snappy_title: "Cold Coffee", medium_title: "Saturday alone time", date: "Feb 22", location: "Cambridge, MA", photoCount: 9, gradient: "from-ink-100 to-paper-warm" },
  { id: "f4", snappy_title: "First Snow", medium_title: "Sledding at Larz", date: "Jan 9", location: "Boston, MA", photoCount: 56, gradient: "from-juni-soft to-juni-mint" },
  { id: "f5", snappy_title: "Brunswick", medium_title: "Visiting mom", date: "Dec 27", location: "Brunswick, ME", photoCount: 124, gradient: "from-juni-peach to-paper-warm" },
  { id: "f6", snappy_title: "Solo Hike", medium_title: "Middlesex Fells loop", date: "Nov 30", location: "Medford, MA", photoCount: 31, gradient: "from-juni-mint to-juni-peach" },
  { id: "f7", snappy_title: "Friendsgiving", medium_title: "At the Ortizes'", date: "Nov 23", location: "Newton, MA", photoCount: 73, gradient: "from-juni-rose to-juni-peach" },
  { id: "f8", snappy_title: "10 Years", medium_title: "Anniversary dinner", date: "Oct 18", location: "Boston, MA", photoCount: 22, gradient: "from-juni-soft to-juni-rose" },
  { id: "f9", snappy_title: "Tide Pools", medium_title: "Cape Ann morning", date: "Sep 14", location: "Rockport, MA", photoCount: 64, gradient: "from-juni-mint to-paper-warm" },
  { id: "f10", snappy_title: "Concert Lawn", medium_title: "Tanglewood night", date: "Aug 9", location: "Lenox, MA", photoCount: 38, gradient: "from-ink-100 to-juni-soft" },
  { id: "f11", snappy_title: "Bike to Brookline", medium_title: "Sunday loop", date: "Jul 14", location: "Boston, MA", photoCount: 19, gradient: "from-juni-peach to-juni-mint" },
  { id: "f12", snappy_title: "Pool Day", medium_title: "Backyard cookout", date: "Jul 4", location: "Wellesley, MA", photoCount: 98, gradient: "from-juni-soft to-juni-peach" },
  { id: "f13", snappy_title: "Maine Coast", medium_title: "Week at Pemaquid", date: "Jun 22", location: "Bristol, ME", photoCount: 207, gradient: "from-juni-mint to-juni-rose" },
  { id: "f14", snappy_title: "Last Day of School", medium_title: "Kindergarten ends", date: "Jun 15", location: "Wellesley, MA", photoCount: 47, gradient: "from-juni-peach to-juni-soft" },
  { id: "f15", snappy_title: "Lilacs", medium_title: "Arnold Arboretum walk", date: "May 12", location: "Boston, MA", photoCount: 28, gradient: "from-juni-rose to-juni-mint" },
  { id: "f16", snappy_title: "Town Soccer", medium_title: "Spring season opener", date: "Apr 30", location: "Wellesley, MA", photoCount: 55, gradient: "from-juni-soft to-paper-warm" },
  { id: "f17", snappy_title: "Park Avenue", medium_title: "Family Sunday", date: "Apr 6", location: "Wellesley, MA", photoCount: 35, gradient: "from-juni-mint to-juni-soft" },
  { id: "f18", snappy_title: "Maple Sugar", medium_title: "Vermont weekend", date: "Mar 1", location: "Stowe, VT", photoCount: 71, gradient: "from-juni-peach to-juni-rose" },
  { id: "f19", snappy_title: "Snowed In", medium_title: "Two days, no plans", date: "Feb 8", location: "Wellesley, MA", photoCount: 16, gradient: "from-ink-100 to-juni-mint" },
  { id: "f20", snappy_title: "New Year's", medium_title: "At the Walshes'", date: "Jan 1", location: "Boston, MA", photoCount: 44, gradient: "from-juni-rose to-juni-soft" },
];
