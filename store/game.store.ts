import { create } from "zustand";

import type { IGame } from "@/features/game/game.schemas";

export interface GameStore {
  game: IGame | null;
  setGame: (game: IGame) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  setGame: (game: IGame) => {
    set({ game });
  },
}));
