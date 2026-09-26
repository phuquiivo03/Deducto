import { Entity, Relationship, Clue, Note } from "@/types/detective";

export const entities: Record<string, Entity> = {
  violet: {
    id: "violet",
    type: "suspect",
    name: "Lady Violet",
    meta: "Art dealer · Right-handed",

    x: 70,
    y: 70,

    facts: [
      {
        ok: true,
        text: "An art dealer who was invited to the dinner.",
      },
      {
        ok: true,
        text: "Right-handed",
      },
      {
        ok: true,
        text: "Arrived at 9:15 PM, wearing gloves",
      },
      {
        ok: false,
        text: "Not at the Mansion after 10 PM",
      },
    ],
  },

  grant: {
    id: "grant",
    type: "suspect",
    name: "Professor Grant",
    meta: "Historian · Left-handed",

    x: 1000,
    y: 50,

    facts: [
      {
        ok: true,
        text: "Left-handed",
      },
      {
        ok: false,
        text: "Avoids enclosed rooms — documented fear",
      },
      {
        ok: true,
        text: "Seen reading in the study at 10 PM",
      },
    ],
  },

  chen: {
    id: "chen",
    type: "suspect",
    name: "Mr. Chen",
    meta: "Chef · Ambidextrous",

    x: 70,
    y: 560,

    facts: [
      {
        ok: true,
        text: "Placed in the library until midnight",
      },
      {
        ok: true,
        text: "Had kitchen access all evening",
      },
    ],
  },

  dagger: {
    id: "dagger",
    type: "weapon",
    name: "Crystal Dagger",
    meta: "Found near the garden",

    x: 560,
    y: 270,

    facts: [
      {
        ok: true,
        text: "Found damp, near the fountain",
      },
      {
        ok: true,
        text: "Matches the wound pattern",
      },
    ],
  },

  candlestick: {
    id: "candlestick",
    type: "weapon",
    name: "Candlestick",
    meta: "Missing from the study",

    x: 1080,
    y: 300,

    facts: [
      {
        ok: true,
        text: "Reported missing at 9 PM",
      },
    ],
  },

  poison: {
    id: "poison",
    type: "weapon",
    name: "Poison Vial",
    meta: "Locked in the cabinet",

    x: 640,
    y: 700,

    facts: [
      {
        ok: true,
        text: "Cabinet was locked all evening",
      },
    ],
  },

  garden: {
    id: "garden",
    type: "location",
    name: "Garden",
    meta: "Empty at 11:15 PM",

    x: 540,
    y: 560,

    facts: [
      {
        ok: true,
        text: "Confirmed empty at 11:15 PM",
      },
      {
        ok: true,
        text: "Fountain area accessible from the terrace",
      },
    ],
  },

  library: {
    id: "library",
    type: "location",
    name: "Library",
    meta: "Occupied until midnight",

    x: 70,
    y: 800,

    facts: [
      {
        ok: true,
        text: "Fire was lit from 9 PM to midnight",
      },
    ],
  },

  conservatory: {
    id: "conservatory",
    type: "location",
    name: "Conservatory",
    meta: "Locked after 10 PM",

    x: 1080,
    y: 600,

    facts: [
      {
        ok: true,
        text: "Locked from the inside after 10 PM",
      },
    ],
  },
};

export const relationships: Relationship[] = [];

export const clues: Clue[] = [
  {
    id: "1",
    status: "analyzed",
    text: "The Crystal Dagger was found near the garden fountain, still damp.",
    entities: [],
  },

  {
    id: "2",
    status: "analyzed",
    text: "Lady Violet was seen entering the mansion at 9:15 PM, wearing gloves.",
    entities: ["violet"],
  },

  {
    id: "3",
    status: "new",
    text: "The butler confirms the garden was empty at 11:15 PM.",
    entities: ["garden"],
  },

  {
    id: "4",
    status: "new",
    text: "Professor Grant has a documented fear of enclosed spaces.",
    entities: ["grant", "conservatory"],
  },

  {
    id: "5",
    status: "used",
    text: "A witness places Mr. Chen in the library until midnight.",
    entities: ["chen", "library"],
  },

  {
    id: "6",
    status: "analyzed",
    text: "Lady Violet is right-handed.",
    entities: ["violet"],
  },
];

export const initialNotes: Note[] = [
  {
    id: "n1",
    x: 340,
    y: 60,
    rot: -1.4,
    text: "Probably Violet…",
  },

  {
    id: "n2",
    x: 820,
    y: 820,
    rot: 1.1,
    text: "Check the garden clue again",
  },
];
