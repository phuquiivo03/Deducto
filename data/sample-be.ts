import { IGame, IAnswer } from "@/features/game/game.schemas";
import { sampleIds } from "@/data/sample-ids";

export const sampleGame: IGame = {
  id: sampleIds.game,
  creator: sampleIds.user,
  title: "The Missing Sapphire",
  description:
    "A priceless sapphire disappeared during a private dinner. Four guests were present, each in a different room with a different object and a different motive.",
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
        avatar: "👩‍⚕️",
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
        description: "A slim silver blade used to open letters.",
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
        description: "A decorative crystal dagger with a slim blade.",
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
        description: "A heavy brass candlestick with a wide base.",
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
        description: "A small folding knife with a worn handle.",
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

    // The clues force Violet, the Silver Letter Opener, the Dining
    // Room, and Greed. The other guests' motives can still swap.
    clues: [
      {
        id: sampleIds.clues.c1,
        type: "LOCATION",
        attribute: "location",
        value: "Library",
        relation: "EQUAL",
        suspect_id: sampleIds.suspects.arthur,
        location_id: sampleIds.locations.library,
      },
      {
        id: sampleIds.clues.c2,
        type: "LOCATION",
        attribute: "location",
        value: "Garden",
        relation: "EQUAL",
        suspect_id: sampleIds.suspects.eleanor,
        location_id: sampleIds.locations.garden,
      },
      {
        id: sampleIds.clues.c3,
        type: "RELATION",
        attribute: "location",
        value: "Study",
        relation: "AT",
        suspect_id: sampleIds.suspects.charles,
        location_id: sampleIds.locations.study,
      },
      {
        id: sampleIds.clues.c4,
        type: "LOCATION",
        attribute: "found_at",
        value: "Library",
        relation: "EQUAL",
        weapon_id: sampleIds.weapons.candlestick,
        location_id: sampleIds.locations.library,
      },
      {
        id: sampleIds.clues.c5,
        type: "RELATION",
        attribute: "found_at",
        value: "Garden",
        relation: "FOUND_AT",
        weapon_id: sampleIds.weapons.pocketKnife,
        location_id: sampleIds.locations.garden,
      },
      {
        id: sampleIds.clues.c6,
        type: "EXCLUSION",
        attribute: "weapon",
        value: "Silver Letter Opener",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.charles,
        weapon_id: sampleIds.weapons.letterOpener,
      },
      {
        id: sampleIds.clues.c7,
        type: "EXCLUSION",
        attribute: "motive",
        value: "Revenge",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c8,
        type: "EXCLUSION",
        attribute: "motive",
        value: "Jealousy",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c9,
        type: "EXCLUSION",
        attribute: "motive",
        value: "Blackmail",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c10,
        type: "ATTRIBUTE",
        attribute: "location",
        value: "Dining Room",
        relation: "REQUIRED",
      },
    ],
  },
};

export const sampleResult: IAnswer = {
  id: sampleIds.result,
  game_id: sampleIds.game,
  user_id: sampleIds.user,
  time_taken: 1000,
  answer: {
    murder_id: sampleIds.suspects.violet,
    weapon_id: sampleIds.weapons.letterOpener,
    motive_id: sampleIds.motives.greed,
    location_id: sampleIds.locations.diningRoom,
  },
};
