"use client";
import DetectiveBoard from "@/components/detective-board/DetectiveBoard";
import Container from "@/components/layout/Container";
import IntroCard from "@/components/ui/IntroCard";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/game.store";

function CasePage({ id }: { id: string }) {
  const [gameReady, setGameReady] = useState<boolean>(false);
  const game = useGameStore((state) => state.game);
  const setGame = useGameStore((state) => state.setGame);
  useEffect(() => {
    setGameReady(false);
    fetch(`/api/game/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setGame(data.data);
          setGameReady(true);
        }
      });
  }, [id, setGame]);
  const [started, setStarted] = useState<boolean>(false);
  return (
    <main className="h-screen overflow-hidden">
      {started && game ? (
        <DetectiveBoard />
      ) : (
        <Container>
          <IntroCard
            start={() => setStarted(true)}
            disabled={!gameReady || !game}
          />
        </Container>
      )}
    </main>
  );
}

export default CasePage;
