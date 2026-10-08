import CaseSession from "@/components/case/case-session";
import { isGameNotFound } from "@/features/game/game-errors";
import type { IGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { applySamplePuzzles } from "@/features/puzzles/apply-sample-puzzles";
import { presentGameForPlayer } from "@/features/puzzles/present-game";
import { notFound, unstable_rethrow } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function loadCase(id: string): Promise<IGame | null> {
  try {
    return await gameServices.getById(id);
  } catch (error) {
    unstable_rethrow(error);
    if (isGameNotFound(error)) return null;
    throw error;
  }
}

export default async function CasePage({ params }: PageProps) {
  const { id } = await params;
  const game = await loadCase(id);
  if (!game) {
    notFound();
  }

  return (
    <CaseSession
      key={game.id}
      game={presentGameForPlayer(applySamplePuzzles(game))}
    />
  );
}
