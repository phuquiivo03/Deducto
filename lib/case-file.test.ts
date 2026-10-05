import assert from "node:assert/strict";
import test from "node:test";

import {
  caseFileFromGame,
  formatDifficulty,
  UNNAMED_VICTIM,
  victimFromDescription,
} from "./case-file";

test("formatDifficulty maps known levels and keeps unknown text", () => {
  assert.equal(formatDifficulty("easy"), "Easy");
  assert.equal(formatDifficulty("MEDIUM"), "Medium");
  assert.equal(formatDifficulty(" hard "), "Hard");
  assert.equal(formatDifficulty("expert"), "expert");
  assert.equal(formatDifficulty("  "), "Unknown");
});

test("victimFromDescription reads the named victim from the case file", () => {
  assert.equal(
    victimFromDescription(
      "Lord Everleigh was found dead in his Victorian manor during a violent thunderstorm.",
    ),
    "Lord Everleigh",
  );
  assert.equal(
    victimFromDescription(
      "Jonathan Raven was discovered in his study after the dinner party.",
    ),
    "Jonathan Raven",
  );
  assert.equal(
    victimFromDescription(
      "A university guard was found dead on campus, and three suspects remain.",
    ),
    "A university guard",
  );
  assert.equal(
    victimFromDescription("Dr. Eleanor Hale was found in the chapel."),
    "Dr. Eleanor Hale",
  );
  assert.equal(
    victimFromDescription(
      "A priceless sapphire disappeared during a private dinner. Four guests were present.",
    ),
    null,
  );
  assert.equal(
    victimFromDescription(
      "Nothing useful. Then Lord Ashcombe was found in the abbey.",
    ),
    null,
  );
});

test("caseFileFromGame uses the loaded case, not a sample story", () => {
  const file = caseFileFromGame({
    title: "Stormy Inheritance",
    description:
      "Lord Everleigh was found dead in his Victorian manor during a violent thunderstorm. Three guests were present.",
    level: "medium",
  });
  assert.equal(file.title, "Stormy Inheritance");
  assert.match(file.description, /Lord Everleigh/);
  assert.equal(file.difficulty, "Medium");
  assert.equal(file.victim, "Lord Everleigh");
  assert.equal(file.title.includes("Midnight"), false);

  const theft = caseFileFromGame({
    title: "The Missing Sapphire",
    description:
      "A priceless sapphire disappeared during a private dinner. Four guests were present.",
    level: "easy",
  });
  assert.equal(theft.victim, UNNAMED_VICTIM);
  assert.equal(theft.difficulty, "Easy");
});
