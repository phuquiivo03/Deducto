import { z } from "zod";

export const userSubmissionSchema = z.object({
  game_id: z.string(),
  user_id: z.string(),
  time_taken: z.number().int(),
  created_at: z.string().optional(),
});

export type IUserSubmission = z.infer<typeof userSubmissionSchema>;
