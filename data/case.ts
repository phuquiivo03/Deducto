import { Item, Clue, Solution } from "@/types/game";

export const suspects: Item[] = [
  {
    id: "violet",
    emoji: "💐",
    name: "Violet",
    detail:
      "Violet Ashcroft, the victim's niece. She was at a gala across town.",
  },
  {
    id: "marcus",
    emoji: "🎩",
    name: "Marcus",
    detail:
      "Marcus Cole, former business partner. No alibi during murder window.",
  },
  {
    id: "eleanor",
    emoji: "🌿",
    name: "Eleanor",
    detail: "Groundskeeper. Witnesses saw her in the garden.",
  },
];

export const evidence: Item[] = [
  {
    id: "dagger",
    emoji: "🗡️",
    name: "Dagger",
    detail: "Missing ornamental dagger from the study.",
  },
  {
    id: "vial",
    emoji: "🧪",
    name: "Poison vial",
    detail: "Empty vial found in greenhouse.",
  },
  {
    id: "letter",
    emoji: "✉️",
    name: "Torn letter",
    detail: "Letter matching Marcus's notebook.",
  },
];

export const places: Item[] = [
  {
    id: "library",
    emoji: "📚",
    name: "Library",
    detail: "Guests were reading here.",
  },
  {
    id: "garden",
    emoji: "🌷",
    name: "Garden",
    detail: "Eleanor's working area.",
  },
  {
    id: "study",
    emoji: "🕯️",
    name: "Study",
    detail: "Body was discovered here.",
  },
];

export const clues: Clue[] = [
  {
    t: "Violet was NOT at the mansion",
    d: "She was seen at a charity gala.",
  },
  {
    t: "The person with the dagger was...",
    d: "Seen leaving the study at 11:40 PM.",
  },
  {
    t: "Eleanor never left the garden",
    d: "Kitchen staff confirmed.",
  },
  {
    t: "Marcus had no alibi",
    d: "Nobody confirmed his location.",
  },
  {
    t: "A torn letter matches a notepad",
    d: "Found inside Marcus's coat.",
  },
];

export const solution: Solution = {
  suspect: "marcus",
  evidence: "dagger",
  place: "study",
};
