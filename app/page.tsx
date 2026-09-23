"use client";

import { useState } from "react";

import Container from "@/components/layout/Container";
import IntroCard from "@/components/Game/IntroCard";
import InvestigationBoard from "@/components/Game/InvestigationBoard";

export default function Page() {
  const [started, setStarted] = useState(false);

  return (
    <Container>
      {started ? (
        <InvestigationBoard />
      ) : (
        <IntroCard start={() => setStarted(true)} />
      )}
    </Container>
  );
}
