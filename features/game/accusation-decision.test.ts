import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  ACCUSATION_ATTEMPT_LIMIT,
  decideAccusation,
  shouldReadSolution,
  type AccusationGuess,
  type AccusationSolution,
} from "./accusation-decision"

const solution: AccusationSolution = {
  murderId: "murder",
  weaponId: "weapon",
  motiveId: "motive",
  locationId: "location",
}

const correct: AccusationGuess = { ...solution }

const wrong: AccusationGuess = {
  murderId: "other-suspect",
  weaponId: "weapon",
  motiveId: "motive",
  locationId: "location",
}

const PUBLIC_KEYS = [
  "alreadySolved",
  "attemptLimit",
  "attemptsRemaining",
  "attemptsUsed",
  "solved",
]

describe("decideAccusation", () => {
  it("returns solved only when every field matches", () => {
    const decision = decideAccusation({
      alreadySolved: false,
      attemptsUsed: 0,
      solution,
      guess: correct,
    })

    assert.equal(decision.type, "record")
    if (decision.type !== "record") {
      return
    }
    assert.equal(decision.solved, true)
    assert.deepEqual(Object.keys(decision.result).sort(), PUBLIC_KEYS)
    assert.equal(decision.result.solved, true)
    assert.equal(decision.result.alreadySolved, false)
    assert.equal(decision.result.attemptsUsed, 1)
    assert.equal(decision.result.attemptsRemaining, ACCUSATION_ATTEMPT_LIMIT - 1)
    assert.equal("murder" in decision.result, false)
    assert.equal("weapon" in decision.result, false)
    assert.equal("motive" in decision.result, false)
    assert.equal("location" in decision.result, false)
  })

  it("does not reveal which field was wrong", () => {
    const decision = decideAccusation({
      alreadySolved: false,
      attemptsUsed: 2,
      solution,
      guess: wrong,
    })

    assert.equal(decision.type, "record")
    if (decision.type !== "record") {
      return
    }
    assert.equal(decision.solved, false)
    assert.equal(decision.result.solved, false)
    assert.equal(JSON.stringify(decision.result).includes("other-suspect"), false)
    assert.equal(JSON.stringify(decision.result).includes("murder"), false)
  })

  it("does not compare a guess after the case is solved", () => {
    const decision = decideAccusation({
      alreadySolved: true,
      attemptsUsed: 1,
      solution,
      guess: wrong,
    })

    assert.equal(decision.type, "already-solved")
    if (decision.type !== "already-solved") {
      return
    }
    assert.equal(decision.result.solved, true)
    assert.equal(decision.result.alreadySolved, true)
    assert.equal(decision.result.attemptsUsed, 1)
  })

  it("does not compare a guess once the attempt cap is spent", () => {
    const decision = decideAccusation({
      alreadySolved: false,
      attemptsUsed: ACCUSATION_ATTEMPT_LIMIT,
      solution,
      guess: correct,
    })

    assert.deepEqual(decision, {
      type: "limit",
      attemptsUsed: ACCUSATION_ATTEMPT_LIMIT,
      attemptLimit: ACCUSATION_ATTEMPT_LIMIT,
    })
  })

  it("does not compare when the solution row is missing", () => {
    const decision = decideAccusation({
      alreadySolved: false,
      attemptsUsed: 0,
      solution: null,
      guess: correct,
    })

    assert.deepEqual(decision, { type: "missing" })
  })

  it("reads the solution only for an open case under the cap", () => {
    assert.equal(
      shouldReadSolution({ alreadySolved: false, attemptsUsed: 0 }),
      true,
    )
    assert.equal(
      shouldReadSolution({
        alreadySolved: false,
        attemptsUsed: ACCUSATION_ATTEMPT_LIMIT - 1,
      }),
      true,
    )
    assert.equal(
      shouldReadSolution({
        alreadySolved: false,
        attemptsUsed: ACCUSATION_ATTEMPT_LIMIT,
      }),
      false,
    )
    assert.equal(
      shouldReadSolution({ alreadySolved: true, attemptsUsed: 0 }),
      false,
    )
  })
})
