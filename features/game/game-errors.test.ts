import assert from "node:assert/strict";
import test from "node:test";

import {
  GameNotFoundError,
  gameGetStatus,
  isGameNotFound,
} from "./game-errors";

test("a missing game is a 404, other failures stay 500", () => {
  assert.equal(isGameNotFound(new GameNotFoundError()), true);
  assert.equal(isGameNotFound(new Error("Game not found")), true);
  assert.equal(isGameNotFound(new Error("Could not load game")), false);
  assert.equal(gameGetStatus(new GameNotFoundError()), 404);
  assert.equal(gameGetStatus(new Error("Could not load game")), 500);
});
