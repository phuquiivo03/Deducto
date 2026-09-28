import { createClient } from "@/infrastructure/supabase/server";
import { IAnswer, IAnswerAnswer, IGame } from "./game.schemas";
import { mapGameFromDb, type GameDbRow } from "./game.mapper";

const getGame = async (id: string): Promise<IGame | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, game_metadata(*, clues(*), locations(*), suspects(*), weapons(*), motives(*))",
    )
    .eq("id", id)
    .single();
  if (error || !data) {
    return null;
  }
  return mapGameFromDb(data as GameDbRow);
};

const getResult = async (id: string): Promise<IAnswerAnswer | null> => {
  const supabase = await createClient();
  const result = await supabase
    .from("results")
    .select("*")
    .eq("game_id", id)
    .single();
  return result.data;
};

const gameRepositories = {
  getGame,
  getResult,
};
export default gameRepositories;
