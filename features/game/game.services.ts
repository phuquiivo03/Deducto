import { IAnswer, IAnswerResponse, IGame } from "@/features/game/game.schemas";
import gameRepositories from "./game.repositories";
import submissionRepositories from "../submission/submission.repositories";

const validateResult = async (data: IAnswer): Promise<IAnswerResponse> => {
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
    await submissionRepositories.create({
      game_id: data.game_id,
      user_id: data.user_id,
      time_taken: data.time_taken,
    });
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
const gameServices = {
  validateResult,
  getById,
  isResolved,
};

export default gameServices;
