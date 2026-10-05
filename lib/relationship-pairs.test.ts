import assert from "node:assert/strict";
import test from "node:test";

import type { IGame } from "@/features/game/game.schemas";

import {
  MATRIX_TYPE_PAIRS,
  matrixBlockTitle,
  relationshipCapacity,
  relationshipCapacityForGame,
} from "./relationship-pairs";

test("every matrix block has a heading", () => {
  for (const [rowType, colType] of MATRIX_TYPE_PAIRS) {
    const title = matrixBlockTitle(rowType, colType);
    assert.notEqual(title, "");
    assert.match(title, /×/);
  }
  assert.equal(matrixBlockTitle("suspect", "motive"), "Suspects × Motives");
  assert.equal(matrixBlockTitle("weapon", "motive"), "Weapons × Motives");
  assert.equal(
    matrixBlockTitle("location", "motive"),
    "Locations × Motives",
  );
});

test("relationship capacity follows the loaded sets, not a fixed 9", () => {
  assert.equal(
    relationshipCapacity({
      suspect: 3,
      weapon: 3,
      location: 3,
      motive: 3,
    }),
    18,
  );
  assert.equal(
    relationshipCapacity({
      suspect: 4,
      weapon: 4,
      location: 4,
      motive: 4,
    }),
    24,
  );
  assert.equal(
    relationshipCapacity({
      suspect: 3,
      weapon: 3,
      location: 3,
      motive: 0,
    }),
    9,
  );
});

test("relationshipCapacityForGame counts metadata arrays", () => {
  const total = relationshipCapacityForGame({
    gameMetadata: {
      id: "meta",
      suspects: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
      weapons: [{ id: "w1" }, { id: "w2" }, { id: "w3" }],
      locations: [{ id: "l1" }, { id: "l2" }, { id: "l3" }],
      motives: [{ id: "m1" }, { id: "m2" }, { id: "m3" }],
      clues: [],
    },
  } as unknown as Pick<IGame, "gameMetadata">);
  assert.equal(total, 18);
  assert.equal(
    relationshipCapacityForGame({ gameMetadata: "metadata-id" }),
    0,
  );
});
