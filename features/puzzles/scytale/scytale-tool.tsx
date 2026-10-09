"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CipherFields, PaperRoundButton } from "../paper-kit";
import { useReportReading, type PuzzleToolProps } from "../toolkit";
import {
  codePoints,
  decodeScytale,
  openingScytaleColumns,
  scytaleReadingMatches,
} from "./scytale";
import {
  columnBounds,
  columnsFromRatio,
  dragColumns,
  scytaleWrapLayout,
  stepColumns,
  thicknessLabel,
  thicknessRatio,
  type WrapLetter,
} from "./wrap-geometry";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Horizontal paper rod. Thickness is the column count, drawn
 * but never printed. The stored diameter is not in this payload.
 * The slider's ARIA value is a percent so the count is not read out.
 */
export function ScytaleTool(props: PuzzleToolProps) {
  return (
    <ScytaleSession
      key={props.cipher}
      cipher={props.cipher}
      sentence={props.sentence}
      onReading={props.onReading}
    />
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);
  return reduced;
}

function ScytaleSession({
  cipher,
  sentence,
  onReading,
}: {
  cipher: string;
  sentence: string;
  onReading: (reading: string) => void;
}) {
  const hatchId = `scytale-hatch-${useId().replace(/:/g, "")}`;
  const rodRef = useRef<SVGGElement>(null);
  const reduced = usePrefersReducedMotion();
  const [live, setLive] = useState(false);
  const length = useMemo(() => codePoints(cipher).length, [cipher]);
  const [columns, setColumns] = useState(() =>
    openingScytaleColumns(cipher, sentence),
  );
  const bounds = columnBounds(length);
  const safeColumns = stepColumns(columns, 0, length);
  const layout = useMemo(
    () => scytaleWrapLayout(cipher, safeColumns),
    [cipher, safeColumns],
  );
  const reading = decodeScytale(cipher, safeColumns);
  const matchedNow = scytaleReadingMatches(reading, sentence);
  const debouncedMatched = useDebounce(matchedNow, 2000);
  const matched = matchedNow ? debouncedMatched : false;
  useReportReading(reading, onReading);

  const shift = (delta: number) => {
    setColumns((current) => stepColumns(current, delta, length));
  };

  const onArrows = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      shift(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      shift(1);
    }
  };

  return (
    <div
      className={
        reduced
          ? "puzzle-paper scytale-still space-y-3"
          : "puzzle-paper space-y-3"
      }
    >
      <div className="mx-auto w-full">
        <Rod
          hatchId={hatchId}
          letters={layout.letters}
          layout={layout}
          matched={matched}
          rodRef={rodRef}
          length={length}
          columns={safeColumns}
          onArrows={onArrows}
          onColumns={setColumns}
          onLive={setLive}
        />
      </div>
      <p className="text-center text-sm text-pencil/70">
        Dải giấy quấn quanh thanh. Đọc mỗi vòng từ trái sang phải.
      </p>
      <div className="flex items-center gap-3">
        <PaperRoundButton
          label="Làm thanh mỏng hơn"
          onClick={() => shift(-1)}
          disabled={safeColumns <= bounds.min}
        >
          ‹
        </PaperRoundButton>
        <ThicknessSlider
          columns={safeColumns}
          length={length}
          live={live}
          onArrows={onArrows}
          onColumns={setColumns}
          onLive={setLive}
        />
        <PaperRoundButton
          label="Làm thanh dày hơn"
          onClick={() => shift(1)}
          disabled={safeColumns >= bounds.max}
        >
          ›
        </PaperRoundButton>
      </div>
      <CipherFields cipher={cipher} plain={reading} />
    </div>
  );
}

function Rod({
  hatchId,
  letters,
  layout,
  matched,
  rodRef,
  length,
  columns,
  onArrows,
  onColumns,
  onLive,
}: {
  hatchId: string;
  letters: WrapLetter[];
  layout: ReturnType<typeof scytaleWrapLayout>;
  matched: boolean;
  rodRef: React.RefObject<SVGGElement | null>;
  length: number;
  columns: number;
  onArrows: (event: React.KeyboardEvent) => void;
  onColumns: (next: number) => void;
  onLive: (live: boolean) => void;
}) {
  const dragRef = useRef<{
    pointer: number;
    x: number;
    y: number;
    columns: number;
  } | null>(null);
  const { rod } = layout;
  const ratio = thicknessRatio(columns, length);

  const onPointerDown = (event: React.PointerEvent<SVGRectElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    rodRef.current?.focus();
    onLive(true);
    dragRef.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      columns,
    };
  };

  const onPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    onColumns(
      dragColumns(
        drag.columns,
        event.clientX - drag.x,
        event.clientY - drag.y,
        length,
      ),
    );
  };

  const onPointerUp = (event: React.PointerEvent<SVGRectElement>) => {
    if (dragRef.current?.pointer !== event.pointerId) return;
    dragRef.current = null;
    onLive(false);
  };

  return (
    <svg
      viewBox={`0 0 ${layout.view.width} ${layout.view.height}`}
      role="group"
      aria-label="Thanh scytale với dải giấy quấn quanh"
      className="h-auto w-full touch-none overflow-visible"
    >
      <defs>
        <pattern
          id={hatchId}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <line x1="0" y1="0" x2="0" y2="6" className="scytale-hatch" />
        </pattern>
      </defs>
      <path d={rod.body} className="scytale-body" aria-hidden />
      {rod.grain.map((d, index) => (
        <path
          key={`grain-${index}`}
          d={d}
          className="scytale-grain"
          aria-hidden
        />
      ))}
      {layout.lead ? (
        <path d={layout.lead} className="scytale-band" aria-hidden />
      ) : null}
      {layout.ribbons.map((d, index) => (
        <path
          key={`ribbon-${index}`}
          d={d}
          className="scytale-band"
          aria-hidden
        />
      ))}
      <path d={rod.body} className="scytale-outline" aria-hidden />
      {layout.tail ? (
        <path d={layout.tail} className="scytale-band" aria-hidden />
      ) : null}
      <g aria-hidden>
        {letters
          .filter((letter) => letter.visible)
          .map((letter) => (
            <g
              key={`letter-${letter.index}`}
              transform={
                `translate(${letter.x} ${letter.y}) ` +
                `scale(1 ${letter.scaleY}) ` +
                `rotate(${letter.tilt})`
              }
            >
              {letter.char === " " ? (
                <line x1={-4} y1={3} x2={4} y2={3} className="scytale-space" />
              ) : (
                <text
                  className={
                    matched ? "scytale-letter puzzle-glow" : "scytale-letter"
                  }
                  fontSize={layout.fontSize}
                >
                  {letter.char}
                </text>
              )}
            </g>
          ))}
      </g>
      <g
        ref={rodRef}
        className="scytale-handle"
        tabIndex={0}
        role="slider"
        aria-label="Đầu thanh, kéo hoặc dùng phím mũi tên để đổi độ dày"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuetext={thicknessLabel(columns, length)}
        onKeyDown={onArrows}
      >
        <path d={rod.cap} className="scytale-cap" />
        <ellipse
          cx={rod.capCx}
          cy={rod.cy}
          rx={rod.capRx * 0.78}
          ry={rod.radius * 0.78}
          fill={`url(#${hatchId})`}
          stroke="none"
        />
        <circle cx={rod.capCx} cy={rod.cy} r={5} className="scytale-knob" />
        <rect
          x={rod.capCx - rod.capRx - 6}
          y={rod.cy - rod.radius}
          width={rod.capRx * 2 + 18}
          height={rod.radius * 2}
          className="scytale-hit"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </g>
    </svg>
  );
}

function ThicknessSlider({
  columns,
  length,
  live,
  onArrows,
  onColumns,
  onLive,
}: {
  columns: number;
  length: number;
  live: boolean;
  onArrows: (event: React.KeyboardEvent) => void;
  onColumns: (next: number) => void;
  onLive: (live: boolean) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ratio = thicknessRatio(columns, length);

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const next = (clientX - rect.left) / rect.width;
    onColumns(columnsFromRatio(next, length));
  };

  return (
    <div
      ref={trackRef}
      className={live ? "scytale-slider scytale-slider-live" : "scytale-slider"}
      role="slider"
      tabIndex={0}
      aria-label="Độ dày của thanh"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuetext={thicknessLabel(columns, length)}
      onKeyDown={onArrows}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onLive(true);
        setFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        const captured = event.currentTarget.hasPointerCapture(event.pointerId);
        if (!captured) return;
        setFromClientX(event.clientX);
      }}
      onPointerUp={(event) => {
        const captured = event.currentTarget.hasPointerCapture(event.pointerId);
        if (!captured) return;
        onLive(false);
      }}
      onPointerCancel={() => {
        onLive(false);
      }}
    >
      <span className="scytale-slider-track" aria-hidden />
      <span
        className="scytale-slider-thumb"
        style={{ left: `calc(${ratio} * (100% - 1.35rem))` }}
        aria-hidden
      />
    </div>
  );
}
