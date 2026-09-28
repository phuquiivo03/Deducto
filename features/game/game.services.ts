import { IAnswer, IAnswerResponse, IGame } from "@/features/game/game.schemas";
import gameRepositories from "./game.repositories";

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
  return response;
};

const getById = async (id: string): Promise<IGame> => {
  const game = await gameRepositories.getGame(id);
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
};
const gameServices = {
  validateResult,
  getById,
};

export default gameServices;
