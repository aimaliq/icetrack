/**
 * The reaction set, shared by the buttons on entry pages and the little
 * cluster on cards. Keys are what the database stores; the emoji is only
 * presentation, so the set can be restyled without orphaning counts.
 */
export const REACTIONS = [
  { key: "heart_eyes", emoji: "😍", label: "Love it" },
  { key: "heart", emoji: "❤️", label: "Heart" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "money", emoji: "💸", label: "Expensive" },
  { key: "thumbs_down", emoji: "👎", label: "Dislike" },
  { key: "poop", emoji: "💩", label: "Awful" },
] as const;

export const EMOJI_BY_KEY: Record<string, string> = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r.emoji]),
);
