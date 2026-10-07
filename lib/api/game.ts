import type { IShortGame } from "@/features/game/game.schemas";

const getGames = async (tab: string): Promise<IShortGame[]> => {
  const result = await fetch(`/api/game?tab=${tab}`);
  const data = await result.json();
  return data.data as IShortGame[];
};

export const gameApi = {
  getGames,
};
