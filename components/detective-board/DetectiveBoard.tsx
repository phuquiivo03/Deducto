"use client";

import { useState } from "react";

import TopBar from "./TopBar";
import CluePanel from "./CluePanel";
import BoardToolbar from "./BoardToolbar";
import BoardCanvas from "./BoardCanvas";
import InspectorPanel from "./InspectorPanel";
import GridView from "./GridView";
import MobileNav from "./MobileNav";

import {
  entities as initialEntities,
  relationships as initialRelationships,
  clues,
  initialNotes,
} from "@/data/detective-board";

import { Entity, Note, Relationship } from "@/types/detective";

export default function DetectiveBoard() {
  const [entities, setEntities] =
    useState<Record<string, Entity>>(initialEntities);

  const [relationships, setRelationships] =
    useState<Relationship[]>(initialRelationships);

  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const [selected, setSelected] = useState<string | null>(null);

  const [view, setView] = useState<"board" | "grid">("board");

  const updateRelationship = (
    id: string,
    status: "confirmed" | "impossible",
  ) => {
    setRelationships((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
            }
          : r,
      ),
    );
  };

  return (
    <div
      className="
h-screen
flex
flex-col
overflow-hidden
"
    >
      <TopBar relationships={relationships} />

      <div
        className="
flex
flex-1
min-h-0
"
      >
        <CluePanel clues={clues} onSelect={(id) => setSelected(id)} />

        <main
          className="
flex-1
flex
min-w-0
"
        >
          <div
            className="
flex-1
flex
flex-col
min-w-0
"
          >
            <BoardToolbar view={view} setView={setView} />

            {view === "board" && (
              <BoardCanvas
                entities={entities}
                setEntities={setEntities}
                relationships={relationships}
                selected={selected}
                setSelected={setSelected}
                notes={notes}
                setNotes={setNotes}
              />
            )}

            {view === "grid" && (
              <div
                className="
flex-1
overflow-auto
p-6
"
              >
                <GridView entities={entities} />
              </div>
            )}
          </div>

          <InspectorPanel
            entity={selected ? entities[selected] : undefined}
            entities={entities}
            relationships={relationships}
            onUpdateRelationship={updateRelationship}
          />
        </main>
      </div>

      <MobileNav active="Board" setActive={() => {}} />
    </div>
  );
}
