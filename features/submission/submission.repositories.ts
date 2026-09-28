import { createClient } from "@/infrastructure/supabase/server";
import { IUserSubmission, userSubmissionSchema } from "./submission.schemas";

const findByUserAndGame = async (
  userId: string,
  gameId: string,
): Promise<IUserSubmission | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .single();
  if (error || !data) {
    return null;
  }
  return userSubmissionSchema.parse(data);
};

const create = async (
  data: IUserSubmission,
): Promise<IUserSubmission | null> => {
  const supabase = await createClient();
  const result = await supabase
    .from("user_submissions")
    .insert(data)
    .select("*")
    .single();
  if (result.error || !result.data)
    throw new Error(result.error?.message || "Failed to create submission");
  return result.data;
};

const submissionRepositories = {
  findByUserAndGame,
  create,
};
export default submissionRepositories;
