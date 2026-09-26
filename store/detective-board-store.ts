import { create } from "zustand";

import { initialNotes } from "@/data/detective-board";
import { sampleGame } from "@/data/sample-be";
import { gameToClues } from "@/lib/clues.helper";
import { gameToEntities } from "@/lib/game-to-entities";
import type { Clue, Entity, Note, Relationship } from "@/types/detective";
import type { IResult, IResultResponse } from "@/types/apiDto";
import type { IGame } from "@/types/apiDto";

export interface DetectiveBoardState {
  entities: Record<string, Entity>;
  relationships: Relationship[];
  clues: Clue[];
  notes: Note[];
  selected: string | null;
  view: "board" | "grid";
  answer: IResult | null;
  game: IGame | null;
  setAnswer: (answer: IResult) => void;
  resultResponse: IResultResponse | null;
  setResultResponse: (resultResponse: IResultResponse) => void;
}

export const useDetectiveBoardStore = create<DetectiveBoardState>((set) => ({
  entities: gameToEntities(sampleGame),
  relationships: [],
  clues: gameToClues(sampleGame),
  notes: initialNotes,
  selected: null,
  view: "board",
  answer: null,
  game: sampleGame,
  setAnswer: (answer: IResult) => {
    set((state) => ({ ...state, answer }));
  },
  resultResponse: null,
  setResultResponse: (resultResponse: IResultResponse) => {
    set((state) => ({ ...state, resultResponse }));
  },
}));
