"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

import type { IAnswerResponse } from "@/features/game/game.schemas";
import type { EntityType } from "@/types/detective";
import { useGameStore } from "@/store/game.store";

const TYPE_ORDER: EntityType[] = ["suspect", "weapon", "location", "motive"];

export interface AccusationResultCard {
  type: EntityType;
  title: string;
  name: string;
}

interface Props {
  result: IAnswerResponse;
  cards: AccusationResultCard[];
  onClose: () => void;
  onRetry: () => void;
}

function fireConfetti() {
  const defaults = { origin: { y: 0.7, x: 0.5 } };
  const bursts: Array<{
    particleRatio: number;
    spread: number;
    startVelocity?: number;
    decay?: number;
    scalar?: number;
  }> = [
    { particleRatio: 0.25, spread: 26, startVelocity: 55 },
    { particleRatio: 0.2, spread: 66, startVelocity: 55 },
    { particleRatio: 0.14, spread: 100, decay: 0.91, scalar: 0.8 },
    {
      particleRatio: 0.1,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    },
    { particleRatio: 0.05, spread: 100, decay: 0.91, scalar: 0.8 },
  ];

  for (const burst of bursts) {
    confetti({
      ...defaults,
      spread: burst.spread,
      startVelocity: burst.startVelocity,
      decay: burst.decay,
      scalar: burst.scalar,
      particleCount: Math.floor(200 * burst.particleRatio),
    });
  }
}

function verdictCopy(result: IAnswerResponse): {
  title: string;
  body: string;
  tone: "solved" | "open";
} {
  if (result.alreadySolved) {
    return {
      title: "Case already closed",
      body: "Bạn đã giải quyết vụ án này.",
      tone: "solved",
    };
  }

  if (result.solved) {
    return {
      title: "Case closed",
      body: "Cáo buộc của bạn chính xác. Vụ án đã được giải quyết.",
      tone: "solved",
    };
  }

  if (result.attemptsRemaining === 0) {
    return {
      title: "Not solved",
      body: `Bạn đã sử dụng tất cả ${result.attemptLimit} cáo buộc cho trường hợp này.`,
      tone: "open",
    };
  }

  return {
    title: "Not solved",
    body: `Cáo buộc của bạn không đúng. Còn ${result.attemptsRemaining} cáo buộc cho trường hợp này.`,
    tone: "open",
  };
}

export default function AccusationResultModal({
  result,
  cards,
  onClose,
  onRetry,
}: Props) {
  const { setIsSolved } = useGameStore();
  const verdict = verdictCopy(result);
  const canRetry = !result.solved && result.attemptsRemaining > 0;
  const orderedCards = TYPE_ORDER.map((type) =>
    cards.find((card) => card.type === type),
  ).filter((card): card is AccusationResultCard => card !== undefined);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (result.solved) {
      setIsSolved(true);
    }
  }, [result.solved, setIsSolved]);

  useEffect(() => {
    if (result.solved && !result.alreadySolved) {
      fireConfetti();
    }
  }, [result.solved, result.alreadySolved]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-pencil/55"
        aria-label="Close result"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="accusation-result-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-erased bg-card shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-erased bg-paper/95 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-pen">
              Kết luận
            </p>
            <h2
              id="accusation-result-title"
              className="mt-1 font-heading text-lg font-semibold text-pencil"
            >
              {verdict.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-wobbly-sm border border-erased bg-card px-2.5 py-1.5 text-xs font-semibold text-pencil/70 hover:bg-paper"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div
            role="status"
            className={`rounded-wobbly-md border px-4 py-4 text-center ${
              verdict.tone === "solved"
                ? "border-pen bg-pen/10"
                : "border-erased bg-paper/60"
            }`}
          >
            <p
              className={`text-xs ${
                verdict.tone === "solved" ? "text-pen/80" : "text-pencil/70"
              }`}
            >
              {verdict.body}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-pencil">
              Cáo buộc của bạn
            </h3>
            <dl className="grid gap-2">
              {orderedCards.map((card) => (
                <div
                  key={card.type}
                  className="rounded-wobbly-md border border-erased bg-card px-3 py-2"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-pencil/70">
                    {card.title}
                  </dt>
                  <dd className="text-sm font-semibold text-pencil">
                    {card.name}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-wobbly-md border border-erased bg-card py-2.5 text-sm font-semibold text-pencil transition hover:bg-paper"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
