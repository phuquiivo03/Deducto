"use client";
import DetectiveBoard from "@/components/detective-board/DetectiveBoard";
import IntroCard from "@/components/ui/IntroCard";
import Container from "@/components/layout/Container";
import { useState } from "react";

export default function Home() {
  const [started, setStarted] = useState(false);
  return (
    <main className="h-screen overflow-hidden">
      {started ? (
        <DetectiveBoard />
      ) : (
        <Container>
          <IntroCard start={() => setStarted(true)} />
        </Container>
      )}
    </main>
  );
}
