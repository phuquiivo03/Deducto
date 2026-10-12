import { z } from "zod";

import { createClient } from "@/infrastructure/supabase/server";
import { createServiceClient } from "@/infrastructure/supabase/service";
import {
  userSubmissionSchema,
  type IUserSubmission,
  type LeaderboardEntry,
} from "./submission.schemas";

const solverSchema = z.object({ name: z.string() });

const leaderboardRowSchema = z.object({
  user_id: z.string(),
  time_taken: z.number(),
  solver: z
    .union([solverSchema, z.array(solverSchema), z.null()])
    .optional(),
});

function solverName(solver: z.infer<typeof leaderboardRowSchema>["solver"]) {
  const row = Array.isArray(solver) ? solver[0] : solver;
  return row?.name ?? "";
}

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

/**
 * Solved times for one case, fastest first.
 * Uses the service role because submission SELECT is limited to the
 * signed-in player's own row. Callers must already know the case is visible.
 */
const findByGame = async (gameId: string): Promise<LeaderboardEntry[]> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_submissions")
    .select("user_id, time_taken, solver:user_id(name)")
    .eq("game_id", gameId)
    .order("time_taken", { ascending: true });
  if (error) {
    console.error("findByGame:", error.message);
    throw new Error("Could not load leaderboard");
  }
  const parsed = z.array(leaderboardRowSchema).safeParse(data ?? []);
  if (!parsed.success) {
    console.error("findByGame: unexpected row");
    throw new Error("Could not load leaderboard");
  }
  return parsed.data.map((row) => ({
    userId: row.user_id,
    name: solverName(row.solver),
    timeTaken: row.time_taken,
  }));
};

const submissionRepositories = {
  findByUserAndGame,
  create,
  findByGame,
};
export default submissionRepositories;
