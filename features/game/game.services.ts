import {
  IAnswer,
  IAnswerResponse,
  ICreateGameInput,
  IGame,
  IGeneratedCase,
  GameLevelStrict,
  generatedCaseSchema,
  IShortGame,
} from "@/features/game/game.schemas";
import { extractJson } from "@/lib/extract-json";
import gameRepositories from "./game.repositories";
import submissionRepositories from "../submission/submission.repositories";

const validateResult = async (
  data: IAnswer,
  sessionUserId: string | null,
): Promise<IAnswerResponse> => {
  const resultFromDatabase = await gameRepositories.getResult(data.game_id);
  if (!resultFromDatabase) {
    throw new Error("Result not found");
  }
  const response: IAnswerResponse = {
    murder: false,
    weapon: false,
    motive: false,
    location: false,
  };
  if (resultFromDatabase.murder_id === data.answer.murder_id) {
    response.murder = true;
  }
  if (resultFromDatabase.weapon_id === data.answer.weapon_id) {
    response.weapon = true;
  }
  if (resultFromDatabase.motive_id === data.answer.motive_id) {
    response.motive = true;
  }
  if (resultFromDatabase.location_id === data.answer.location_id) {
    response.location = true;
  }
  if (
    response.murder &&
    response.weapon &&
    response.motive &&
    response.location
  ) {
    if (sessionUserId) {
      await submissionRepositories.create({
        game_id: data.game_id,
        user_id: sessionUserId,
        time_taken: data.time_taken,
      });
    }
  }
  return response;
};

const getById = async (id: string): Promise<IGame> => {
  const game = await gameRepositories.getGame(id);
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
};
const isResolved = async (userId: string, gameId: string): Promise<boolean> => {
  const submission = await submissionRepositories.findByUserAndGame(
    userId,
    gameId,
  );
  if (!submission) {
    return false;
  }
  return true;
};

const generate = async (
  prompt: string,
  level: GameLevelStrict,
  userId: string,
): Promise<IGeneratedCase> => {
  const createdAt = new Date().toISOString();
  const requestText = [
    `Level: ${level}`,
    `Creator: ${userId}`,
    `Created at: ${createdAt}`,
    "",
    prompt,
  ].join("\n");

  const raw = await gameRepositories.askAi(requestText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new Error("Could not parse case JSON from the model");
  }

  const result = generatedCaseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
};

const create = async (
  input: ICreateGameInput,
  creatorId: string,
): Promise<string> => {
  return gameRepositories.createGame(input, creatorId);
};

const findPublic = async (): Promise<IShortGame[]> => {
  return gameRepositories.findPublic();
};

const findSolved = async (userId: string): Promise<IShortGame[]> => {
  return gameRepositories.findResolved(userId);
};

const findByUserId = async (userId: string): Promise<IShortGame[]> => {
  return gameRepositories.findByUserId(userId);
};

const gameServices = {
  validateResult,
  getById,
  isResolved,
  generate,
  create,
  findPublic,
  findSolved,
  findByUserId,
};

export default gameServices;
