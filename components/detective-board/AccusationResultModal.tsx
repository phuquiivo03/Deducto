"use client";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { IAnswerResponse } from "@/features/game/game.schemas";
import type { EntityType } from "@/types/detective";
import { useGameStore } from "@/store/game.store";

const TYPE_ORDER: EntityType[] = ["suspect", "weapon", "location", "motive"];

const RESULT_KEY: Record<EntityType, keyof IAnswerResponse> = {
  suspect: "murder",
  weapon: "weapon",
  location: "location",
  motive: "motive",
};

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

function FlipCard({
  card,
  isCorrect,
  isRevealed,
  onReveal,
}: {
  card: AccusationResultCard;
  isCorrect: boolean;
  isRevealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div className="perspective-[1000px] h-[140px] w-full">
      <button
        type="button"
        disabled={isRevealed}
        aria-pressed={isRevealed}
        aria-label={
          isRevealed
            ? `${card.title}: ${card.name}, ${isCorrect ? "correct" : "wrong"}`
            : `Reveal ${card.title.toLowerCase()} card`
        }
        onClick={onReveal}
        className={`
relative
h-full
w-full
rounded-wobbly-md
border
border-erased
text-left
transition-transform
duration-500
motion-reduce:transition-none
[disabled]:cursor-default
${isRevealed ? "" : "cursor-pointer hover:border-pencil"}
`}
        style={{
          transformStyle: "preserve-3d",
          transform: isRevealed ? "rotateY(180deg)" : undefined,
        }}
      >
        <div
          className="
absolute
inset-0
flex
flex-col
items-center
justify-center
gap-1
rounded-wobbly-md
bg-gradient-to-br
from-pencil
to-pencil
p-3
text-postit
shadow-inner
"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-heading text-2xl font-bold text-postit">
            ?
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide">
            {card.title}
          </span>
          <span className="text-[10px] text-postit/80">Tap to reveal</span>
        </div>

        <div
          className="
absolute
inset-0
flex
flex-col
items-center
justify-center
gap-2
rounded-wobbly-md
bg-card
p-3
"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-pencil/70">
            {card.title}
          </span>
          <span className="line-clamp-2 text-center text-sm font-semibold text-pencil">
            {card.name}
          </span>
          <span
            className={`
rounded-full
px-2.5
py-0.5
text-[10px]
font-bold
uppercase
tracking-wide
${
  isCorrect
    ? "border border-pen bg-pen/10 text-pen"
    : "border border-marker/40 bg-marker/10 text-marker"
}
`}
          >
            {isCorrect ? "Correct" : "Wrong"}
          </span>
        </div>
      </button>
    </div>
  );
}
var count = 200;
var defaults = {
  origin: { y: 0.7, x: 0.5 },
};
function fire(
  particleRatio: number,
  opts: {
    spread: number;
    startVelocity?: number;
    decay?: number;
    scalar?: number;
  },
) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    }),
  );
}

export default function AccusationResultModal({
  result,
  cards,
  onClose,
  onRetry,
}: Props) {
  const initialRevealed = useMemo(
    () =>
      TYPE_ORDER.reduce(
        (acc, type) => {
          acc[type] = false;
          return acc;
        },
        {} as Record<EntityType, boolean>,
      ),
    [],
  );

  const [revealed, setRevealed] =
    useState<Record<EntityType, boolean>>(initialRevealed);

  const handleReveal = useCallback((type: EntityType) => {
    setRevealed((prev) => {
      if (prev[type]) {
        return prev;
      }
      return { ...prev, [type]: true };
    });
  }, []);

  const allRevealed = TYPE_ORDER.every((type) => revealed[type]);

  const correctCount = useMemo(
    () => Object.values(result).filter(Boolean).length,
    [result],
  );

  const allCorrect = correctCount === 4;
  const { setIsSolved } = useGameStore();
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
    if (allCorrect && allRevealed) {
      setIsSolved(true);
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 66,
        startVelocity: 55,
      });
      fire(0.14, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.05, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
    }
  }, [allRevealed]);
  return (
    <div
      className="
fixed
inset-0
z-50
flex
items-center
justify-center
p-4
"
      role="presentation"
    >
      <button
        type="button"
        className="
absolute
inset-0
bg-pencil/55

"
        aria-label="Close result"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="accusation-result-title"
        className="
relative
w-full
max-w-md
max-h-[90vh]
overflow-y-auto
rounded-2xl
border
border-erased
bg-card
shadow-xl
"
      >
        <div
          className="
sticky
top-0
z-10
flex
items-start
justify-between
gap-3
border-b
border-erased
bg-paper/95
px-5
py-4

"
        >
          <div>
            <p
              className="
text-[11px]
font-semibold
uppercase
tracking-wide
text-pen
"
            >
              Verdict
            </p>
            <h2
              id="accusation-result-title"
              className="
mt-1
font-heading
text-lg
font-semibold
text-pencil
"
            >
              Reveal your accusation
            </h2>
            <p className="mt-1 text-xs text-pencil/70">
              Flip each card to see how you did.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
shrink-0
rounded-wobbly-sm
border
border-erased
bg-card
px-2.5
py-1.5
text-xs
font-semibold
text-pencil/70
hover:bg-paper
"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <FlipCard
                key={card.type}
                card={card}
                isCorrect={result[RESULT_KEY[card.type]]}
                isRevealed={revealed[card.type]}
                onReveal={() => handleReveal(card.type)}
              />
            ))}
          </div>

          {allRevealed && (
            <div
              role="status"
              className={`
rounded-wobbly-md
border
px-4
py-4
text-center
${
  allCorrect
    ? "border-pen bg-pen/10"
    : "border-erased bg-paper/60"
}
`}
            >
              {allCorrect ? (
                <>
                  <p className="font-heading text-base font-semibold text-pen">
                    Case closed!
                  </p>
                  <p className="mt-1 text-xs text-pen/80">
                    You named the culprit — every part of your accusation was
                    correct. Congratulations, detective.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-heading text-base font-semibold text-pencil">
                    {correctCount} of 4 correct
                  </p>
                  <p className="mt-1 text-xs text-pencil/70">
                    The case remains open. Review the board and try again.
                  </p>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="
mt-3
w-full
rounded-wobbly-md
border
border-erased
bg-card
py-2.5
text-sm
font-semibold
text-pencil
transition
hover:bg-paper
"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
