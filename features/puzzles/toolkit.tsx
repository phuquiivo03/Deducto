"use client";

import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PuzzleDialog } from "./puzzle-dialog";
import {
  listPuzzleKinds,
  puzzleCipherText,
  readingMatchesSentence,
  type PuzzleKind,
} from "./registry";
import type { PlayerPuzzle } from "./types";
import { useDebounce } from "@/hooks/use-debounce";

export interface PuzzleToolProps {
  cipher: string;
  sentence: string;
  onReading: (reading: string) => void;
}

export interface PuzzleSolveModalProps {
  puzzle: PlayerPuzzle;
  sentence: string;
  onClose: () => void;
  onSolved: () => void;
}

interface ReadingReport {
  kind: PuzzleKind;
  value: string;
}

/**
 * Report the tool's current reading without retriggering on a new
 * callback identity.
 */
export function useReportReading(
  reading: string,
  onReading: (reading: string) => void,
) {
  const onReadingRef = useRef(onReading);
  useEffect(() => {
    onReadingRef.current = onReading;
  }, [onReading]);
  useEffect(() => {
    onReadingRef.current(reading);
  }, [reading]);
}

/**
 * Shared solve popup. Every registered kind is a tool. The ciphertext
 * is the same flat string for each tool. The stored kind is not the
 * tool that opens. A wrong tool only changes the reading.
 */
export function PuzzleToolkit({
  puzzle,
  sentence,
  onClose,
  onSolved,
  tools,
}: PuzzleSolveModalProps & {
  tools: Record<PuzzleKind, ComponentType<PuzzleToolProps>>;
}) {
  const kinds = listPuzzleKinds();
  const firstKind = kinds[0]?.kind;
  const [active, setActive] = useState<PuzzleKind | null>(firstKind ?? null);
  const [reading, setReading] = useState<ReadingReport | null>(null);
  const titleId = useId();
  const helpId = useId();
  const tabRef = useRef<HTMLButtonElement>(null);
  const cipher = puzzleCipherText(puzzle);
  const matchedNow =
    active !== null &&
    reading?.kind === active &&
    readingMatchesSentence(active, reading.value, sentence);
  const debouncedMatched = useDebounce(matchedNow, 2000);
  const matched = matchedNow ? debouncedMatched : false;
  const Tool = active ? tools[active] : null;

  return (
    <PuzzleDialog
      titleId={titleId}
      descriptionId={helpId}
      onClose={onClose}
      initialFocusRef={tabRef}
    >
      <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-erased px-5 py-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-heading text-pen">
            <Lock className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Manh mối bị khóa
          </p>
          <h2 id={titleId} className="mt-1 font-heading text-2xl text-pencil">
            Bộ giải mật mã
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="
shrink-0 border-2 border-pencil bg-card px-3 py-1.5
rounded-wobbly-sm font-heading text-base text-pencil
hover:bg-postit
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
"
        >
          Đóng
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-5 py-4">
        <p id={helpId} className="text-sm leading-relaxed text-pencil">
          Chọn một công cụ và thử đọc mật mã.
        </p>
        <div
          role="tablist"
          aria-label="Công cụ giải mã"
          className="flex flex-wrap gap-2"
        >
          {kinds.map((option, index) => {
            const selected = option.kind === active;
            return (
              <button
                key={option.kind}
                ref={index === 0 ? tabRef : undefined}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(option.kind)}
                className={
                  selected
                    ? `
border-2 border-pencil bg-pen px-3 py-1
rounded-wobbly-sm font-heading text-base text-card
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
`
                    : `
border-2 border-pencil bg-card px-3 py-1
rounded-wobbly-sm font-heading text-base text-pencil
hover:bg-postit
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
`
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {Tool && active ? (
          <Tool
            key={active}
            cipher={cipher}
            sentence={sentence}
            onReading={(value) => {
              setReading({ kind: active, value });
            }}
          />
        ) : null}

        {matched ? (
          <div className="puzzle-stamp space-y-3 border-2 border-pencil bg-postit p-4 rounded-wobbly-sm">
            <p className="font-heading text-xl text-pencil">Khớp rồi</p>
            <p className="text-base text-pencil">{sentence}</p>
            <Button type="button" onClick={onSolved}>
              Ghim manh mối lên bảng
            </Button>
          </div>
        ) : null}
      </div>
    </PuzzleDialog>
  );
}
