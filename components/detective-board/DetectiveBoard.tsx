"use client";

import { useEffect, useState } from "react";

import TopBar from "./TopBar";
import CluePanel from "./CluePanel";
import BoardToolbar from "./BoardToolbar";
import BoardCanvas from "./BoardCanvas";
import InspectorPanel from "./InspectorPanel";
import GridView from "./GridView";
import MobileNav from "./MobileNav";

import {
  findRelationshipByPair,
  pairRelationshipId,
  canonicalPair,
  relationshipCapacityForGame,
} from "@/lib/relationship-pairs";

import {
  Clue,
  Entity,
  Note,
  Relationship,
  RelationshipStatus,
} from "@/types/detective";
import { gameToEntities } from "@/lib/game-to-entities";
import { gameToClues } from "@/lib/clues.helper";
import { useGameStore } from "@/store/game.store";
export default function DetectiveBoard() {
  const game = useGameStore((state) => state.game);

  const [entities, setEntities] = useState<Record<string, Entity>>({});

  const [relationships, setRelationships] = useState<Relationship[]>([]);

  const [clues, setClues] = useState<Clue[]>([]);

  const [notes, setNotes] = useState<Note[]>([]);

  const [selected, setSelected] = useState<string | null>(null);

  const [view, setView] = useState<"board" | "grid">("board");
  const updateRelationship = (
    id: string,
    status: RelationshipStatus,
    label?: string,
  ) => {
    setRelationships((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              ...(label !== undefined ? { label } : {}),
            }
          : r,
      ),
    );
  };

  const removeRelationship = (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id));
  };

  const setPairStatus = (
    idA: string,
    idB: string,
    status: RelationshipStatus,
    label?: string,
  ) => {
    setRelationships((prev) => {
      const existing = findRelationshipByPair(prev, idA, idB);
      if (existing) {
        return prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                status,
                ...(label !== undefined ? { label } : {}),
              }
            : r,
        );
      }
      const [a, b] = canonicalPair(idA, idB);
      return [
        ...prev,
        {
          id: pairRelationshipId(idA, idB),
          a,
          b,
          label: label ?? "?",
          status,
          reason: "",
        },
      ];
    });
  };

  useEffect(() => {
    if (!game) return;
    setEntities(gameToEntities(game));
    setClues(gameToClues(game));
    setRelationships([]);
    setNotes([]);
    setSelected(null);
    setView("board");
  }, [game]);

  if (!game) return null;

  return (
    <div
      className="
h-screen
flex
flex-col
overflow-hidden
"
    >
      <TopBar
        title={game.title}
        relationships={relationships}
        relationshipTotal={relationshipCapacityForGame(game)}
      />

      <div
        className="
flex
flex-1
min-h-0
"
      >
        <CluePanel
          clues={clues}
          onSelect={(id) => {
            const clue = clues.find((c) => c.id === id);
            const nextStatus =
              clue?.status === "analyzed"
                ? "used"
                : clue?.status === "used"
                  ? "new"
                  : "analyzed";
            setClues((prev) =>
              prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)),
            );
          }}
        />

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
            <BoardToolbar view={view} setView={setView} entities={entities} />

            {view === "board" && (
              <BoardCanvas
                entities={entities}
                setEntities={setEntities}
                relationships={relationships}
                selected={selected}
                setSelected={setSelected}
                notes={notes}
                setNotes={setNotes}
                onSetPairStatus={setPairStatus}
                onUpdateRelationship={updateRelationship}
                onRemoveRelationship={removeRelationship}
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
                <GridView
                  entities={entities}
                  relationships={relationships}
                  onSetPairStatus={setPairStatus}
                />
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
