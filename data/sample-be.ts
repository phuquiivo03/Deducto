import { IGame, IAnswer } from "@/features/game/game.schemas";
import { sampleIds } from "@/data/sample-ids";

export const sampleGame: IGame = {
  id: sampleIds.game,
  creator: "system",
  title: "The Missing Sapphire",
  description:
    "A priceless sapphire disappeared during a private dinner. Four guests were present, but only one of them stole it.",
  banner: "/images/cases/missing-sapphire.jpg",
  level: "easy",
  created_at: "2026-09-24T10:00:00Z",

  gameMetadata: {
    id: sampleIds.metadata,

    suspects: [
      {
        id: sampleIds.suspects.violet,
        name: "Lady Violet",
        avatar: "🦹‍♀️",
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
        id: sampleIds.suspects.arthur,
        name: "Mr. Arthur",
        avatar: "👨",
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
        id: sampleIds.suspects.eleanor,
        name: "Dr. Eleanor",
        avatar: "👨",
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
        id: sampleIds.suspects.charles,
        name: "Mr. Charles",
        avatar: "👨",
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
        id: sampleIds.weapons.letterOpener,
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
        id: sampleIds.weapons.crystalDagger,
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
        id: sampleIds.weapons.candlestick,
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
        id: sampleIds.weapons.pocketKnife,
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
        id: sampleIds.locations.diningRoom,
        name: "Dining Room",
        description: "The main room where dinner was served.",
        icon: "🍽️",
        attributes: {
          type: "indoor",
          characteristic: "large dining table",
        },
      },
      {
        id: sampleIds.locations.library,
        name: "Library",
        description: "A quiet room filled with old books.",
        icon: "📚",
        attributes: {
          type: "indoor",
          characteristic: "bookshelves",
        },
      },
      {
        id: sampleIds.locations.garden,
        name: "Garden",
        description: "A large garden behind the mansion.",
        icon: "🌳",
        attributes: {
          type: "outdoor",
          characteristic: "fountain",
        },
      },
      {
        id: sampleIds.locations.study,
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
        id: sampleIds.motives.greed,
        name: "Greed",
        description: "The suspect wanted the sapphire for its value.",
        icon: "💰",
      },
      {
        id: sampleIds.motives.revenge,
        name: "Revenge",
        description: "The suspect wanted revenge against the host.",
        icon: "⚔️",
      },
      {
        id: sampleIds.motives.jealousy,
        name: "Jealousy",
        description: "The suspect was jealous of the host's success.",
        icon: "💔",
      },
      {
        id: sampleIds.motives.blackmail,
        name: "Blackmail",
        description: "The suspect wanted to obtain evidence for leverage.",
        icon: "📜",
      },
    ],

    clues: [
      {
        id: sampleIds.clues.c1,
        type: "ATTRIBUTE",
        attribute: "handedness",
        value: "RIGHT",
        relation: "REQUIRED",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c2,
        type: "LOCATION",
        attribute: "found_at",
        value: "Library",
        relation: "EQUAL",
        weapon_id: sampleIds.weapons.candlestick,
        location_id: sampleIds.locations.library,
      },
      {
        id: sampleIds.clues.c3,
        type: "LOCATION",
        attribute: "found_at",
        value: "Garden",
        relation: "EQUAL",
        weapon_id: sampleIds.weapons.pocketKnife,
        location_id: sampleIds.locations.garden,
      },
      {
        id: sampleIds.clues.c4,
        type: "EXCLUSION",
        attribute: "weapon",
        value: "Crystal Dagger",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.eleanor,
        weapon_id: sampleIds.weapons.crystalDagger,
      },
      {
        id: sampleIds.clues.c5,
        type: "EXCLUSION",
        attribute: "location",
        value: "Dining Room",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.charles,
        location_id: sampleIds.locations.diningRoom,
      },
      {
        id: sampleIds.clues.c6,
        type: "ATTRIBUTE",
        attribute: "weight",
        value: "HEAVY",
        relation: "REQUIRED",
        weapon_id: sampleIds.weapons.candlestick,
      },
    ],
  },
};

export const sampleResult: IAnswer = {
  id: sampleIds.result,
  game_id: sampleIds.game,
  answer: {
    murder_id: sampleIds.suspects.violet,
    weapon_id: sampleIds.weapons.letterOpener,
    motive_id: sampleIds.motives.greed,
    location_id: sampleIds.locations.diningRoom,
  },
};
