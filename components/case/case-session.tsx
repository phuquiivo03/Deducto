"use client";

import { useEffect, useState } from "react";

import DetectiveBoard from "@/components/detective-board/DetectiveBoard";
import Container from "@/components/layout/Container";
import IntroCard from "@/components/ui/IntroCard";
import type { IGame } from "@/features/game/game.schemas";
import { caseFileFromGame } from "@/lib/case-file";
import { useGameStore } from "@/store/game.store";

export default function CaseSession({ game }: { game: IGame }) {
  const setGame = useGameStore((state) => state.setGame);
  const setIsSolved = useGameStore((state) => state.setIsSolved);
  const startClock = useGameStore((state) => state.startClock);
  const [started, setStarted] = useState(false);
  const file = caseFileFromGame(game);

  useEffect(() => {
    setGame(game);
    setIsSolved(false);

    let cancelled = false;
    fetch(`/api/game/${game.id}/resolved`)
      .then((res) => res.json())
      .then((data: { success?: boolean; data?: unknown }) => {
        if (cancelled) return;
        if (data?.success && typeof data.data === "boolean") {
          setIsSolved(data.data);
        }
      })
      .catch(() => {
        // Solve status is optional. The case file still opens.
      });

    return () => {
      cancelled = true;
    };
  }, [game, setGame, setIsSolved]);

  const handleStart = () => {
    setGame(game);
    startClock();
    setStarted(true);
  };

  return (
    <main className="h-screen overflow-hidden">
      {started ? (
        <DetectiveBoard />
      ) : (
        <Container>
          <IntroCard
            title={file.title}
            description={file.description}
            difficulty={file.difficulty}
            victim={file.victim}
            start={handleStart}
          />
        </Container>
      )}
    </main>
  );
}
