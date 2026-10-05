import assert from "node:assert/strict";
import test from "node:test";

import { entityTypeLabel } from "./entity-type-label";

test("motive cards are labeled as motives", () => {
  assert.equal(entityTypeLabel("suspect"), "Suspect");
  assert.equal(entityTypeLabel("weapon"), "Weapon");
  assert.equal(entityTypeLabel("location"), "Location");
  assert.equal(entityTypeLabel("motive"), "Motive");
});
