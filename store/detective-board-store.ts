import { create } from "zustand";

import { initialNotes } from "@/data/detective-board";
import { sampleGame } from "@/data/sample-be";
import { gameToClues } from "@/lib/clues.helper";
import { gameToEntities } from "@/lib/game-to-entities";
import type { Clue, Entity, Note, Relationship } from "@/types/detective";
import type { IAnswer, IAnswerResponse } from "@/features/game/game.schemas";

export interface DetectiveBoardState {
  entities: Record<string, Entity>;
  relationships: Relationship[];
  clues: Clue[];
  notes: Note[];
  selected: string | null;
  view: "board" | "grid";
  answer: IAnswer | null;
  setAnswer: (answer: IAnswer) => void;
  resultResponse: IAnswerResponse | null;
  setResultResponse: (resultResponse: IAnswerResponse | null) => void;
}

export const useDetectiveBoardStore = create<DetectiveBoardState>((set) => ({
  entities: gameToEntities(sampleGame),
  relationships: [],
  clues: gameToClues(sampleGame),
  notes: initialNotes,
  selected: null,
  view: "board",
  answer: null,

  setAnswer: (answer: IAnswer) => {
    set((state) => ({ ...state, answer }));
  },
  resultResponse: null,
  setResultResponse: (resultResponse: IAnswerResponse | null) => {
    set((state) => ({ ...state, resultResponse }));
  },
}));
