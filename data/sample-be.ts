import { IGame } from "@/types/apiDto";

export const sampleGame: IGame = {
  id: "game-001",
  creator: "system",
  title: "The Missing Sapphire",
  description:
    "A priceless sapphire disappeared during a private dinner. Four guests were present, but only one of them stole it.",
  banner: "/images/cases/missing-sapphire.jpg",
  level: "easy",
  created_at: "2026-09-24T10:00:00Z",

  game_metadata: {
    id: "metadata-001",

    suspects: [
      {
        id: "suspect-001",
        name: "Lady Violet",
        avatar: "/images/suspects/violet.jpg",
        age: 42,
        gender: "female",
        description: "An art dealer who was invited to the dinner.",
        attributes: {
          height: 168,
          hairColor: "black",
          handedness: "RIGHT",
          birthday: "1984-05-12",
        },
      },
      {
        id: "suspect-002",
        name: "Mr. Arthur",
        avatar: "/images/suspects/arthur.jpg",
        age: 51,
        gender: "male",
        description: "A wealthy collector and longtime friend of the host.",
        attributes: {
          height: 182,
          hairColor: "brown",
          handedness: "LEFT",
          birthday: "1975-08-21",
        },
      },
      {
        id: "suspect-003",
        name: "Dr. Eleanor",
        avatar: "/images/suspects/eleanor.jpg",
        age: 38,
        gender: "female",
        description: "A doctor who arrived shortly before dinner.",
        attributes: {
          height: 165,
          hairColor: "blonde",
          handedness: "RIGHT",
          birthday: "1988-02-17",
        },
      },
      {
        id: "suspect-004",
        name: "Mr. Charles",
        avatar: "/images/suspects/charles.jpg",
        age: 45,
        gender: "male",
        description: "A journalist investigating the host's business.",
        attributes: {
          height: 176,
          hairColor: "black",
          handedness: "RIGHT",
          birthday: "1981-11-03",
        },
      },
    ],

    weapons: [
      {
        id: "weapon-001",
        name: "Silver Letter Opener",
        description: "A small silver letter opener found near the study.",
        icon: "✉️",
        attributes: {
          weight: "LIGHT",
          material: "silver",
          type: "letter opener",
        },
      },
      {
        id: "weapon-002",
        name: "Crystal Dagger",
        description: "A decorative dagger displayed in the dining room.",
        icon: "🗡️",
        attributes: {
          weight: "MEDIUM",
          material: "crystal",
          type: "dagger",
        },
      },
      {
        id: "weapon-003",
        name: "Brass Candlestick",
        description: "A heavy brass candlestick from the library.",
        icon: "🕯️",
        attributes: {
          weight: "HEAVY",
          material: "brass",
          type: "candlestick",
        },
      },
      {
        id: "weapon-004",
        name: "Pocket Knife",
        description: "A small folding knife found in the garden.",
        icon: "🔪",
        attributes: {
          weight: "LIGHT",
          material: "steel",
          type: "pocket knife",
        },
      },
    ],

    locations: [
      {
        id: "location-001",
        name: "Dining Room",
        description: "The main room where dinner was served.",
        icon: "🍽️",
        attributes: {
          type: "indoor",
          characteristic: "large dining table",
        },
      },
      {
        id: "location-002",
        name: "Library",
        description: "A quiet room filled with old books.",
        icon: "📚",
        attributes: {
          type: "indoor",
          characteristic: "bookshelves",
        },
      },
      {
        id: "location-003",
        name: "Garden",
        description: "A large garden behind the mansion.",
        icon: "🌳",
        attributes: {
          type: "outdoor",
          characteristic: "fountain",
        },
      },
      {
        id: "location-004",
        name: "Study",
        description: "The host's private study.",
        icon: "🖥️",
        attributes: {
          type: "indoor",
          characteristic: "locked cabinet",
        },
      },
    ],

    motives: [
      {
        id: "motive-001",
        name: "Greed",
        description: "The suspect wanted the sapphire for its value.",
        icon: "💰",
      },
      {
        id: "motive-002",
        name: "Revenge",
        description: "The suspect wanted revenge against the host.",
        icon: "⚔️",
      },
      {
        id: "motive-003",
        name: "Jealousy",
        description: "The suspect was jealous of the host's success.",
        icon: "💔",
      },
      {
        id: "motive-004",
        name: "Blackmail",
        description: "The suspect wanted to obtain evidence for leverage.",
        icon: "📜",
      },
    ],

    clues: [
      {
        id: "clue-001",
        type: "ATTRIBUTE",
        attribute: "handedness",
        value: "RIGHT",
        relation: "REQUIRED",
        suspect_id: "suspect-001",
      },
      {
        id: "clue-002",
        type: "LOCATION",
        attribute: "found_at",
        value: "Library",
        relation: "EQUAL",
        weapon_id: "weapon-003",
        location_id: "location-002",
      },
      {
        id: "clue-003",
        type: "LOCATION",
        attribute: "found_at",
        value: "Garden",
        relation: "EQUAL",
        weapon_id: "weapon-004",
        location_id: "location-003",
      },
      {
        id: "clue-004",
        type: "EXCLUSION",
        attribute: "weapon",
        value: "Crystal Dagger",
        relation: "NOT_EQUAL",
        suspect_id: "suspect-003",
        weapon_id: "weapon-002",
      },
      {
        id: "clue-005",
        type: "EXCLUSION",
        attribute: "location",
        value: "Dining Room",
        relation: "NOT_EQUAL",
        suspect_id: "suspect-004",
        location_id: "location-001",
      },
      {
        id: "clue-006",
        type: "ATTRIBUTE",
        attribute: "weight",
        value: "HEAVY",
        relation: "REQUIRED",
        weapon_id: "weapon-003",
      },
    ],
  },
};
