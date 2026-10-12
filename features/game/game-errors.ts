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

/** Rows in `games` for one creator. */
export const MAX_OWNED_CASES = 5;

export const OWNED_CASE_LIMIT_MESSAGE =
  `Mỗi tài khoản chỉ được sở hữu tối đa ${MAX_OWNED_CASES} vụ án.`;

export class OwnedCaseLimitError extends Error {
  constructor() {
    super(OWNED_CASE_LIMIT_MESSAGE);
    this.name = "OwnedCaseLimitError";
  }
}

export function assertOwnedCaseSlot(owned: number): void {
  if (owned >= MAX_OWNED_CASES) {
    throw new OwnedCaseLimitError();
  }
}

export function isOwnedCaseLimit(error: unknown): boolean {
  if (error instanceof OwnedCaseLimitError) return true;
  return (
    error instanceof Error &&
    error.message === OWNED_CASE_LIMIT_MESSAGE
  );
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
