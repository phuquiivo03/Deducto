import assert from "node:assert/strict";
import test from "node:test";

import { initialNotes } from "./detective-board";

test("boards are not seeded with spoiler notes", () => {
  assert.deepEqual(initialNotes, []);
  const serialized = JSON.stringify(initialNotes);
  assert.equal(serialized.includes("Violet"), false);
});
