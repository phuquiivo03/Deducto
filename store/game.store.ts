import { create } from "zustand";

import type { IGame } from "@/features/game/game.schemas";

export interface GameStore {
  game: IGame | null;
  setGame: (game: IGame) => void;
  isSolved: boolean;
  setIsSolved: (isSolved: boolean) => void;
  startedAt: number | null;
  endedAt: number | null;
  startClock: () => void;
  freezeClock: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  setGame: (game: IGame) => {
    set({ game });
  },
  isSolved: false,
  setIsSolved: (isSolved: boolean) => {
    set({ isSolved });
  },
  startedAt: null,
  endedAt: null,
  startClock: () => {
    set({ startedAt: Date.now(), endedAt: null });
  },
  freezeClock: () => {
    set((state) => ({
      endedAt: state.endedAt ?? Date.now(),
    }));
  },
}));
