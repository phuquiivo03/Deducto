"use client";

import { Entity, Relationship, Note } from "@/types/detective";

import EntityCard from "./EntityCard";
import StickyNote from "./StickyNote";
import ConnectionLines from "./ConnectionLines";

interface Props {
  entities: Record<string, Entity>;

  setEntities: React.Dispatch<React.SetStateAction<Record<string, Entity>>>;

  relationships: Relationship[];

  selected: string | null;

  setSelected: (id: string | null) => void;

  notes: Note[];

  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export default function BoardCanvas({
  entities,

  setEntities,

  relationships,

  selected,

  setSelected,

  notes,

  setNotes,
}: Props) {
  return (
    <div
      className="
flex-1
overflow-auto
relative
"
    >
      <div
        className="
relative
w-[1560px]
h-[980px]
bg-[#F5F0E4]
bg-[radial-gradient(#d8cfb8_1px,transparent_1px)]
[background-size:22px_22px]
"
      >
        <ConnectionLines entities={entities} relationships={relationships} />

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
      </div>
    </div>
  );
}
