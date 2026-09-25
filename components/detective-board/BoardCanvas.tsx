"use client";

import { useCallback, useRef, useState } from "react";

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

  const [draft, setDraft] = useState<DraftState | null>(null);

  const [picker, setPicker] = useState<PickerState | null>(null);

  const clientToBoard = useCallback((clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

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

  return (
    <div
      className="
flex-1
overflow-auto
relative
"
    >
      <div
        ref={boardRef}
        className="
relative
w-[1560px]
h-[980px]
bg-[#F5F0E4]
bg-[radial-gradient(#d8cfb8_1px,transparent_1px)]
[background-size:22px_22px]
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
  );
}
