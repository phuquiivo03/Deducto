export class GameNotFoundError extends Error {
  constructor() {
    super("Game not found");
    this.name = "GameNotFoundError";
  }
}

export function isGameNotFound(error: unknown): boolean {
  if (error instanceof GameNotFoundError) return true;
  return error instanceof Error && error.message === "Game not found";
}

export function gameGetStatus(error: unknown): number {
  return isGameNotFound(error) ? 404 : 500;
}
