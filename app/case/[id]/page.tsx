import CaseSession from "@/components/case/case-session";
import { isGameNotFound } from "@/features/game/game-errors";
import type { IGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import submissionRepositories from "@/features/submission/submission.repositories";
import {
  rankSubmissions,
  type LeaderboardRow,
} from "@/features/submission/submission.schemas";
import { getSessionUserId } from "@/features/user/user.auth";
import { applySamplePuzzles } from "@/features/puzzles/apply-sample-puzzles";
import { presentGameForPlayer } from "@/features/puzzles/present-game";
import { notFound, unstable_rethrow } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function loadCase(
  id: string,
): Promise<{ game: IGame; leaderboard: LeaderboardRow[] } | null> {
  try {
    const game = await gameServices.getById(id);
    const viewerId = await getSessionUserId();
    const solves = await submissionRepositories.findByGame(game.id);
    return { game, leaderboard: rankSubmissions(solves, viewerId) };
  } catch (error) {
    unstable_rethrow(error);
    if (isGameNotFound(error)) return null;
    throw error;
  }
}

export default async function CasePage({ params }: PageProps) {
  const { id } = await params;
  const loaded = await loadCase(id);
  if (!loaded) {
    notFound();
  }

  return (
    <CaseSession
      key={loaded.game.id}
      game={presentGameForPlayer(applySamplePuzzles(loaded.game))}
      leaderboard={loaded.leaderboard}
    />
  );
}
