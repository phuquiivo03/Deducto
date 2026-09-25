"use client";

import { useEffect, useRef, useState } from "react";

import { RelationshipStatus } from "@/types/detective";

import { STATUS_OPTIONS, STATUS_STYLE } from "./relationship-line-style";

interface Props {
  x: number;
  y: number;
  current?: RelationshipStatus;
  currentLabel?: string;
  onSave: (status: RelationshipStatus, label: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}

export default function RelationshipPopover({
  x,
  y,
  current,
  currentLabel = "",
  onSave,
  onRemove,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  const [label, setLabel] = useState(currentLabel);

  useEffect(() => {
    setLabel(currentLabel);
  }, [currentLabel, x, y]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }

    function onPointerDown(ev: PointerEvent) {
      const panel = panelRef.current;
      if (panel && !panel.contains(ev.target as Node)) onClose();
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [onClose]);

  function normalizedLabel() {
    const trimmed = label.trim();
    return trimmed.length > 0 ? trimmed : "?";
  }

  function handleSaveStatus(status: RelationshipStatus) {
    onSave(status, normalizedLabel());
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Relationship"
      className="
absolute
z-50
min-w-[200px]
rounded-xl
border
border-[#E7DFCC]
bg-white
p-2
shadow-lg
"
      style={{ left: x, top: y }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p
        className="
px-2
pb-1.5
text-[10px]
font-bold
uppercase
tracking-wide
text-[#9C9482]
"
      >
        Relationship
      </p>

      <label
        className="
block
px-2
pb-2
text-[10px]
font-bold
uppercase
text-[#9C9482]
"
      >
        Label
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. was at, owns"
          className="
mt-1
w-full
rounded-lg
border
border-[#E7DFCC]
px-2
py-1.5
text-xs
font-semibold
text-[#6F6858]
outline-none
focus:ring-2
focus:ring-[#F4E7C6]
focus:border-[#B08328]
"
          onKeyDown={(e) => {
            if (e.key === "Enter" && current !== undefined) {
              handleSaveStatus(current);
            }
          }}
        />
      </label>

      <div className="flex flex-col gap-1">
        {STATUS_OPTIONS.map((status) => {
          const style = STATUS_STYLE[status];
          const isActive = current === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSaveStatus(status)}
              className={`
flex
items-center
gap-2
w-full
px-2
py-1.5
rounded-lg
text-left
text-xs
font-semibold
${isActive ? "bg-[#F4E7C6] ring-1 ring-[#B08328]" : "hover:bg-[#F5F0E4]"}
`}
            >
              <svg width="28" height="8" aria-hidden className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="28"
                  y2="4"
                  stroke={style.stroke}
                  strokeWidth="2"
                  strokeDasharray={style.dash}
                />
              </svg>
              <span className="text-[#6F6858]">{style.label}</span>
            </button>
          );
        })}
      </div>

      {current !== undefined && (
        <button
          type="button"
          onClick={() => handleSaveStatus(current)}
          className="
mt-2
w-full
px-2
py-1.5
rounded-lg
border
border-[#E7DFCC]
bg-[#F5F0E4]
text-xs
font-semibold
text-[#6F6858]
hover:bg-[#EDE7D6]
"
        >
          Save label
        </button>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="
mt-2
w-full
px-2
py-1.5
rounded-lg
border
border-[#E7DFCC]
text-xs
font-semibold
text-[#BD5F51]
hover:bg-[#FDF5F3]
"
        >
          Remove
        </button>
      )}
    </div>
  );
}
