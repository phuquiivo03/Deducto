import {
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
import { assertUniquelySolvable } from "./case-solver";
import { GameNotFoundError } from "./game-errors";

const getById = async (id: string): Promise<IGame> => {
  const game = await gameRepositories.getGame(id);
  if (!game) {
    throw new GameNotFoundError();
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

  assertUniquelySolvable(
    result.data.game.gameMetadata,
    result.data.result,
  );

  return result.data;
};

const create = async (
  input: ICreateGameInput,
  creatorId: string,
): Promise<string> => {
  assertUniquelySolvable(input.gameMetadata, input.result);
  return gameRepositories.createGame(input, creatorId);
};

const findPublic = async (): Promise<IShortGame[]> => {
  return gameRepositories.findPublic();
};

const findSolved = async (userId: string): Promise<IShortGame[]> => {
  const res = await gameRepositories.findResolved(userId);
  return res;
};

const findByUserId = async (userId: string): Promise<IShortGame[]> => {
  const res = await gameRepositories.findByUserId(userId);
  console.log(res);
  return res;
};

const gameServices = {
  getById,
  isResolved,
  generate,
  create,
  findPublic,
  findSolved,
  findByUserId,
};

export default gameServices;
