import { createServiceClient } from "@/infrastructure/supabase/service";
import { createClient } from "@/infrastructure/supabase/server";
import { IAnswerAnswer, IGame } from "./game.schemas";
import { mapGameFromDb, type GameDbRow } from "./game.mapper";

const getGame = async (id: string): Promise<IGame | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, game_metadata(*, clues(*), locations(*), suspects(*), weapons(*), motives(*))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getGame:", error.message);
    return null;
  }
  if (!data) {
    return null;
  }
  return mapGameFromDb(data as GameDbRow);
};

const getResult = async (id: string): Promise<IAnswerAnswer | null> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("game_id", id)
    .maybeSingle();
  if (error) {
    console.error("getResult:", error.message);
    return null;
  }
  return data;
};

const gameRepositories = {
  getGame,
  getResult,
};
export default gameRepositories;
