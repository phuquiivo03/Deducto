import { IGame, IAnswer } from "@/features/game/game.schemas";
import { sampleIds } from "@/data/sample-ids";
import { generateScytalePuzzle } from "@/features/puzzles/scytale/scytale";
import { clueToText } from "@/lib/clues.helper";

const sampleGameDraft: IGame = {
  id: sampleIds.game,
  creator: sampleIds.user,
  title: "Viên sapphire thất lạc",
  description:
    "Trong bữa tối kín, một viên sapphire vô giá đột ngột biến mất. Bốn vị khách đều có mặt — mỗi người ở một căn phòng, với một món đồ và một động cơ khác nhau.",
  banner: "/images/cases/missing-sapphire.jpg",
  level: "easy",
  created_at: "2026-09-24T10:00:00Z",

  gameMetadata: {
    id: sampleIds.metadata,

    suspects: [
      {
        id: sampleIds.suspects.violet,
        name: "Quý bà Violet",
        avatar: "🦹‍♀️",
        age: 42,
        gender: "female",
        description: "Nhà buôn tranh, được mời đến bữa tối.",
        attributes: {
          height: 168,
          hairColor: "black",
          handedness: "RIGHT",
          birthday: "1984-05-12",
        },
      },
      {
        id: sampleIds.suspects.arthur,
        name: "Ông Arthur",
        avatar: "👨",
        age: 51,
        gender: "male",
        description: "Nhà sưu tầm giàu có, bạn lâu năm của chủ nhà.",
        attributes: {
          height: 182,
          hairColor: "brown",
          handedness: "LEFT",
          birthday: "1975-08-21",
        },
      },
      {
        id: sampleIds.suspects.eleanor,
        name: "Bác sĩ Eleanor",
        avatar: "👩‍⚕️",
        age: 38,
        gender: "female",
        description: "Bác sĩ, có mặt ngay trước giờ dùng bữa.",
        attributes: {
          height: 165,
          hairColor: "blonde",
          handedness: "RIGHT",
          birthday: "1988-02-17",
        },
      },
      {
        id: sampleIds.suspects.charles,
        name: "Ông Charles",
        avatar: "👨",
        age: 45,
        gender: "male",
        description: "Nhà báo đang lần theo việc làm ăn của chủ nhà.",
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
        name: "Dao mở thư bạc",
        description: "Lưỡi bạc mảnh, dùng để rạch phong thư.",
        icon: "✉️",
        attributes: {
          weight: "Nhẹ",
          material: "Bạc",
          type: "dao mở thư",
        },
      },
      {
        id: sampleIds.weapons.crystalDagger,
        name: "Dao găm pha lê",
        description: "Dao găm trang trí, lưỡi mỏng, làm bằng pha lê.",
        icon: "🗡️",
        attributes: {
          weight: "Trung bình",
          material: "Pha lê",
          type: "dao găm",
        },
      },
      {
        id: sampleIds.weapons.candlestick,
        name: "Chân nến đồng thau",
        description: "Chân nến đồng thau nặng, đế rộng.",
        icon: "🕯️",
        attributes: {
          weight: "Nặng",
          material: "Đồng thau",
          type: "chân nến",
        },
      },
      {
        id: sampleIds.weapons.pocketKnife,
        name: "Dao bỏ túi",
        description: "Dao gấp nhỏ, cán đã sờn vì dùng lâu.",
        icon: "🔪",
        attributes: {
          weight: "Nhẹ",
          material: "Thép",
          type: "dao bỏ túi",
        },
      },
    ],

    locations: [
      {
        id: sampleIds.locations.diningRoom,
        name: "Phòng ăn",
        description: "Căn phòng chính, nơi bữa tối được bày.",
        icon: "🍽️",
        attributes: {
          type: "Trong nhà",
          characteristic: "Bàn ăn lớn",
        },
      },
      {
        id: sampleIds.locations.library,
        name: "Thư viện",
        description: "Căn phòng tĩnh lặng, ken đặc sách cũ.",
        icon: "📚",
        attributes: {
          type: "Trong nhà",
          characteristic: "Kệ sách",
        },
      },
      {
        id: sampleIds.locations.garden,
        name: "Khu vườn",
        description: "Khu vườn rộng nằm phía sau dinh thự.",
        icon: "🌳",
        attributes: {
          type: "Ngoài trời",
          characteristic: "đài phun nước",
        },
      },
      {
        id: sampleIds.locations.study,
        name: "Phòng làm việc",
        description: "Phòng làm việc riêng của chủ nhà.",
        icon: "🖥️",
        attributes: {
          type: "trong nhà",
          characteristic: "tủ có khóa",
        },
      },
    ],

    motives: [
      {
        id: sampleIds.motives.greed,
        name: "Tham lam",
        description: "Muốn chiếm viên sapphire vì giá trị của nó.",
        icon: "💰",
      },
      {
        id: sampleIds.motives.revenge,
        name: "Báo thù",
        description: "Muốn trả thù chủ nhà.",
        icon: "⚔️",
      },
      {
        id: sampleIds.motives.jealousy,
        name: "Đố kỵ",
        description: "Đố kỵ với thành công của chủ nhà.",
        icon: "💔",
      },
      {
        id: sampleIds.motives.blackmail,
        name: "Tống tiền",
        description: "Muốn đoạt bằng chứng để khống chế chủ nhà.",
        icon: "📜",
      },
    ],

    // Manh mối khóa Quý bà Violet, Dao mở thư bạc, Phòng ăn
    // và Tham lam. Động cơ của các khách khác vẫn có thể hoán đổi.
    // Clue c1 is also wrapped in a required scytale after this object
    // is built. Removing it leaves more than one solution.
    clues: [
      {
        id: sampleIds.clues.c1,
        type: "LOCATION",
        attribute: "location",
        value: "Thư viện",
        relation: "EQUAL",
        suspect_id: sampleIds.suspects.arthur,
        location_id: sampleIds.locations.library,
      },
      {
        id: sampleIds.clues.c2,
        type: "LOCATION",
        attribute: "location",
        value: "Khu vườn",
        relation: "EQUAL",
        suspect_id: sampleIds.suspects.eleanor,
        location_id: sampleIds.locations.garden,
      },
      {
        id: sampleIds.clues.c3,
        type: "RELATION",
        attribute: "location",
        value: "Phòng làm việc",
        relation: "AT",
        suspect_id: sampleIds.suspects.charles,
        location_id: sampleIds.locations.study,
      },
      {
        id: sampleIds.clues.c4,
        type: "LOCATION",
        attribute: "found_at",
        value: "Thư viện",
        relation: "EQUAL",
        weapon_id: sampleIds.weapons.candlestick,
        location_id: sampleIds.locations.library,
      },
      {
        id: sampleIds.clues.c5,
        type: "RELATION",
        attribute: "found_at",
        value: "Khu vườn",
        relation: "FOUND_AT",
        weapon_id: sampleIds.weapons.pocketKnife,
        location_id: sampleIds.locations.garden,
      },
      {
        id: sampleIds.clues.c6,
        type: "EXCLUSION",
        attribute: "weapon",
        value: "Dao mở thư bạc",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.charles,
        weapon_id: sampleIds.weapons.letterOpener,
      },
      {
        id: sampleIds.clues.c7,
        type: "EXCLUSION",
        attribute: "motive",
        value: "Báo thù",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c8,
        type: "EXCLUSION",
        attribute: "motive",
        value: "Đố kỵ",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c9,
        type: "EXCLUSION",
        attribute: "motive",
        value: "Tống tiền",
        relation: "NOT_EQUAL",
        suspect_id: sampleIds.suspects.violet,
      },
      {
        id: sampleIds.clues.c10,
        type: "ATTRIBUTE",
        attribute: "location",
        value: "Phòng ăn",
        relation: "REQUIRED",
      },
    ],
  },
};

/**
 * Lock the first sample clue behind a scytale. The cipher is derived
 * from the rendered sentence, so it stays aligned with the board.
 */
function lockSampleClue(game: IGame): IGame {
  if (typeof game.gameMetadata === "string") return game;
  const meta = game.gameMetadata;
  const targetId = sampleIds.clues.c1;
  const clue = meta.clues.find((item) => item.id === targetId);
  if (!clue) return game;
  const puzzle = {
    ...generateScytalePuzzle(clueToText(clue, meta), "required"),
    hint: "Ghi chép về ông Arthur trong đêm xảy ra vụ án.",
  };
  return {
    ...game,
    gameMetadata: {
      ...meta,
      clues: meta.clues.map((item) =>
        item.id === targetId ? { ...item, puzzle } : item,
      ),
    },
  };
}

export const sampleGame: IGame = lockSampleClue(sampleGameDraft);

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
