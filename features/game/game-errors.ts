export class GameNotFoundError extends Error {
  constructor() {
    super("Game not found");
    this.name = "GameNotFoundError";
  }
}

export class CaseNotSolvableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaseNotSolvableError";
  }
}

export function publishErrorStatus(error: unknown): number {
  return error instanceof CaseNotSolvableError ? 400 : 500;
}

export function isGameNotFound(error: unknown): boolean {
  if (error instanceof GameNotFoundError) return true;
  return error instanceof Error && error.message === "Game not found";
}

export function gameGetStatus(error: unknown): number {
  return isGameNotFound(error) ? 404 : 500;
}
