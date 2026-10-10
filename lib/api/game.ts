import type { IShortGame } from "@/features/game/game.schemas";

const getGames = async (tab: string): Promise<IShortGame[]> => {
  const result = await fetch(`/api/game?tab=${tab}`);
  const data = await result.json();
  return data.data as IShortGame[];
};

const updateVisibility = async (
  id: string,
  visibility: IShortGame["visibility"],
): Promise<IShortGame["visibility"]> => {
  const result = await fetch(`/api/game/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility }),
  });
  const body = (await result.json()) as {
    data: { visibility?: IShortGame["visibility"] } | null;
    success: boolean;
    message: string | null;
  };
  if (!result.ok || !body.success || !body.data?.visibility) {
    throw new Error(body.message ?? "Could not update this case");
  }
  return body.data.visibility;
};

export const gameApi = {
  getGames,
  updateVisibility,
};
