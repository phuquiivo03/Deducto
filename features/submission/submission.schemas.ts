import { z } from "zod";

export const userSubmissionSchema = z.object({
  game_id: z.string(),
  user_id: z.string(),
  time_taken: z.number().int(),
  created_at: z.string().optional(),
});

export type IUserSubmission = z.infer<typeof userSubmissionSchema>;

export const LEADERBOARD_LIMIT = 10;

export interface LeaderboardEntry {
  userId: string;
  name: string;
  timeTaken: number;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  seconds: number;
  isViewer: boolean;
}

function displayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Thám tử";
}

/**
 * Fastest `time_taken` first. Top rows, plus the viewer when they
 * solved outside that page.
 */
export function rankSubmissions(
  entries: readonly LeaderboardEntry[],
  viewerId: string | null,
  limit = LEADERBOARD_LIMIT,
): LeaderboardRow[] {
  const viewer = viewerId?.toLowerCase() ?? null;
  const ordered = [...entries].sort((left, right) => {
    if (left.timeTaken !== right.timeTaken) {
      return left.timeTaken - right.timeTaken;
    }
    return left.userId.localeCompare(right.userId);
  });

  const rows = ordered.map((entry, index) => {
    const userId = entry.userId.toLowerCase();
    return {
      rank: index + 1,
      userId,
      name: displayName(entry.name),
      seconds: entry.timeTaken,
      isViewer: viewer !== null && userId === viewer,
    };
  });

  const page = rows.slice(0, Math.max(0, limit));
  if (viewer === null || page.some((row) => row.isViewer)) return page;
  const own = rows.find((row) => row.isViewer);
  return own ? [...page, own] : page;
}
