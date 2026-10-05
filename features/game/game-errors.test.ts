import assert from "node:assert/strict";
import test from "node:test";

import {
  CaseNotSolvableError,
  GameNotFoundError,
  gameGetStatus,
  isGameNotFound,
  publishErrorStatus,
} from "./game-errors";

test("an unsolvable publish is a client error", () => {
  const error = new CaseNotSolvableError(
    "This case cannot be published because the clues have no solution.",
  );
  assert.equal(error.name, "CaseNotSolvableError");
  assert.equal(publishErrorStatus(error), 400);
  assert.equal(publishErrorStatus(new Error("Could not load game")), 500);
});

test("a missing game is a 404, other failures stay 500", () => {
  assert.equal(isGameNotFound(new GameNotFoundError()), true);
  assert.equal(isGameNotFound(new Error("Game not found")), true);
  assert.equal(isGameNotFound(new Error("Could not load game")), false);
  assert.equal(gameGetStatus(new GameNotFoundError()), 404);
  assert.equal(gameGetStatus(new Error("Could not load game")), 500);
});
