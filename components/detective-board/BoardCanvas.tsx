"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

import {
  Entity,
  Relationship,
  Note,
  RelationshipStatus,
} from "@/types/detective";

import { findRelationshipByPair } from "@/lib/relationship-pairs";

import EntityCard from "./EntityCard";
import StickyNote from "./StickyNote";
import ConnectionLines from "./ConnectionLines";
import RelationshipPopover from "./RelationshipPopover";

const BOARD_WIDTH = 1560;
const BOARD_HEIGHT = 980;
const MIN_BOARD_ZOOM = 0.25;
const MAX_BOARD_ZOOM = 2;
const ZOOM_STEP = 0.1;

type ScrollPoint = { left: number; top: number };

function clampBoardZoom(value: number) {
  return Math.min(MAX_BOARD_ZOOM, Math.max(MIN_BOARD_ZOOM, value));
}

type DraftState = { fromId: string; x: number; y: number };

type PickerState =
  | {
      mode: "create";
      a: string;
      b: string;
      x: number;
      y: number;
    }
  | {
      mode: "edit";
      relId: string;
      x: number;
      y: number;
    };

interface Props {
  entities: Record<string, Entity>;

  setEntities: React.Dispatch<React.SetStateAction<Record<string, Entity>>>;

  relationships: Relationship[];

  selected: string | null;

  setSelected: (id: string | null) => void;

  notes: Note[];

  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;

  onSetPairStatus: (
    idA: string,
    idB: string,
    status: RelationshipStatus,
    label?: string,
  ) => void;

  onUpdateRelationship: (
    id: string,
    status: RelationshipStatus,
    label?: string,
  ) => void;

  onRemoveRelationship: (id: string) => void;
}

export default function BoardCanvas({
  entities,

  setEntities,

  relationships,

  selected,

  setSelected,

  notes,

  setNotes,

  onSetPairStatus,

  onUpdateRelationship,

  onRemoveRelationship,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const pendingScrollRef = useRef<ScrollPoint | null>(null);

  const [zoom, setZoom] = useState(1);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);

  const clientToBoard = useCallback(
    (clientX: number, clientY: number) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const scale = zoomRef.current || 1;
      return {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [],
  );

  const queueZoom = useCallback(
    (nextZoom: number, anchor?: { x: number; y: number }) => {
      const el = scrollRef.current;
      const prev = zoomRef.current;
      const next = clampBoardZoom(nextZoom);
      if (next === prev) return;

      if (el) {
        const pending = pendingScrollRef.current;
        const scrollLeft = pending?.left ?? el.scrollLeft;
        const scrollTop = pending?.top ?? el.scrollTop;
        const ratio = next / prev;

        if (anchor) {
          pendingScrollRef.current = {
            left: anchor.x * ratio - (anchor.x - scrollLeft),
            top: anchor.y * ratio - (anchor.y - scrollTop),
          };
        } else {
          const centerX = scrollLeft + el.clientWidth / 2;
          const centerY = scrollTop + el.clientHeight / 2;
          pendingScrollRef.current = {
            left: centerX * ratio - el.clientWidth / 2,
            top: centerY * ratio - el.clientHeight / 2,
          };
        }
      }

      zoomRef.current = next;
      setZoom(next);
    },
    [],
  );

  useLayoutEffect(() => {
    const pending = pendingScrollRef.current;
    const el = scrollRef.current;
    if (!pending || !el) return;
    el.scrollLeft = pending.left;
    el.scrollTop = pending.top;
    pendingScrollRef.current = null;
  }, [zoom]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    return listenForBoardZoom(scroller);

    function listenForBoardZoom(boardScroller: HTMLDivElement) {
      function handleWheel(event: WheelEvent) {
        if (!event.ctrlKey) return;
        event.preventDefault();

        const prev = zoomRef.current;
        const next = clampBoardZoom(prev - event.deltaY * 0.001);
        const rect = boardScroller.getBoundingClientRect();
        const pending = pendingScrollRef.current;
        const scrollLeft = pending?.left ?? boardScroller.scrollLeft;
        const scrollTop = pending?.top ?? boardScroller.scrollTop;

        queueZoom(next, {
          x: event.clientX - rect.left + scrollLeft,
          y: event.clientY - rect.top + scrollTop,
        });
      }

      boardScroller.addEventListener("wheel", handleWheel, {
        passive: false,
      });
      return () => {
        boardScroller.removeEventListener("wheel", handleWheel);
      };
    }
  }, [queueZoom]);

  const handleZoomOut = useCallback(() => {
    const stepped = Math.round((zoomRef.current - ZOOM_STEP) * 100) / 100;
    queueZoom(stepped);
  }, [queueZoom]);

  const handleZoomIn = useCallback(() => {
    const stepped = Math.round((zoomRef.current + ZOOM_STEP) * 100) / 100;
    queueZoom(stepped);
  }, [queueZoom]);

  const handleResetZoom = useCallback(() => {
    queueZoom(1);
  }, [queueZoom]);

  const handleStartConnect = useCallback(
    (fromId: string, e: React.PointerEvent) => {
      e.preventDefault();

      function move(ev: PointerEvent) {
        const pt = clientToBoard(ev.clientX, ev.clientY);
        setDraft({ fromId, x: pt.x, y: pt.y });
      }

      function up(ev: PointerEvent) {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        setDraft(null);

        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const el = target?.closest("[data-entity-id]") as HTMLElement | null;
        const toId = el?.getAttribute("data-entity-id");
        if (!toId || toId === fromId) return;

        const pt = clientToBoard(ev.clientX, ev.clientY);
        setPicker({
          mode: "create",
          a: fromId,
          b: toId,
          x: pt.x,
          y: pt.y,
        });
      }

      const pt = clientToBoard(e.clientX, e.clientY);
      setDraft({ fromId, x: pt.x, y: pt.y });
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [clientToBoard],
  );

  const handleLineClick = useCallback(
    (rel: Relationship, midX: number, midY: number) => {
      setPicker({
        mode: "edit",
        relId: rel.id,
        x: midX,
        y: midY,
      });
    },
    [],
  );

  const draftFrom = draft ? entities[draft.fromId] : undefined;

  const draftLine =
    draft && draftFrom
      ? { from: draftFrom, x: draft.x, y: draft.y }
      : undefined;

  const pickerExisting =
    picker?.mode === "create" && picker
      ? findRelationshipByPair(relationships, picker.a, picker.b)
      : picker?.mode === "edit"
        ? relationships.find((r) => r.id === picker.relId)
        : undefined;

  const pickerCurrent = pickerExisting?.status;

  const pickerLabel = pickerExisting?.label ?? "";

  const zoomPercent = Math.round(zoom * 100);
  const isMinZoom = zoom <= MIN_BOARD_ZOOM + 0.001;
  const isMaxZoom = zoom >= MAX_BOARD_ZOOM - 0.001;

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} className="absolute inset-0 overflow-auto">
        <div
          className="relative"
          style={{
            width: BOARD_WIDTH * zoom,
            height: BOARD_HEIGHT * zoom,
          }}
        >
          <div
            ref={boardRef}
            style={{
              width: BOARD_WIDTH,
              height: BOARD_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            className="
absolute top-0 left-0
bg-paper
bg-[radial-gradient(#e5e0d8_1px,transparent_1px)]
[background-size:24px_24px]
"
          >
        <ConnectionLines
          entities={entities}
          relationships={relationships}
          draft={draftLine}
          activeId={picker?.mode === "edit" ? picker.relId : null}
          onLineClick={handleLineClick}
        />

        {Object.values(entities).map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            selected={selected === entity.id}
            scale={zoom}
            onSelect={() => setSelected(entity.id)}
            onMove={(x, y) => {
              setEntities((prev) => ({
                ...prev,

                [entity.id]: {
                  ...prev[entity.id],

                  x,

                  y,
                },
              }));
            }}
            onStartConnect={(e) => handleStartConnect(entity.id, e)}
          />
        ))}

        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            scale={zoom}
            onMove={(x, y) => {
              setNotes((prev) =>
                prev.map((n) =>
                  n.id === note.id
                    ? {
                        ...n,

                        x,

                        y,
                      }
                    : n,
                ),
              );
            }}
            onDelete={() => {
              setNotes((prev) => prev.filter((n) => n.id !== note.id));
            }}
            onChange={(text) => {
              setNotes((prev) =>
                prev.map((n) =>
                  n.id === note.id
                    ? {
                        ...n,

                        text,
                      }
                    : n,
                ),
              );
            }}
          />
        ))}

        {picker && (
          <RelationshipPopover
            key={
              picker.mode === "create"
                ? `create-${picker.a}-${picker.b}`
                : `edit-${picker.relId}`
            }
            x={picker.x}
            y={picker.y}
            current={pickerCurrent}
            currentLabel={pickerLabel}
            onClose={() => setPicker(null)}
            onSave={(status, label) => {
              if (picker.mode === "create") {
                onSetPairStatus(picker.a, picker.b, status, label);
              } else {
                onUpdateRelationship(picker.relId, status, label);
              }
              setPicker(null);
            }}
            onRemove={
              picker.mode === "edit"
                ? () => onRemoveRelationship(picker.relId)
                : undefined
            }
          />
        )}
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label="Board zoom"
        className="
absolute bottom-4 right-4 z-30
flex items-center gap-1
rounded-wobbly-sm border-2 border-pencil
bg-card p-1 shadow-hard
"
      >
        <button
          type="button"
          aria-label="Zoom out"
          disabled={isMinZoom}
          onClick={handleZoomOut}
          className="
inline-flex h-11 w-11 items-center justify-center
rounded-wobbly-sm text-pencil
hover:bg-erased/70
focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-pen
disabled:pointer-events-none disabled:opacity-40
"
        >
          <ZoomOut className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Reset zoom, currently ${zoomPercent} percent`}
          onClick={handleResetZoom}
          className="
min-w-14 px-2 h-11
rounded-wobbly-sm text-pencil font-body
hover:bg-erased/70
focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-pen
"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={isMaxZoom}
          onClick={handleZoomIn}
          className="
inline-flex h-11 w-11 items-center justify-center
rounded-wobbly-sm text-pencil
hover:bg-erased/70
focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-pen
disabled:pointer-events-none disabled:opacity-40
"
        >
          <ZoomIn className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}
