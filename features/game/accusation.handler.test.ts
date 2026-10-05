import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  ACCUSATION_ATTEMPT_LIMIT,
  decideAccusation,
  shouldReadSolution,
  type AccusationDecision,
  type AccusationSolution,
  type SubmitAccusationInput,
} from "./accusation-decision"
import { handleAccusationPost } from "./accusation.handler"

const GAME_ID = "b1000001-0001-4001-8001-000000000001"
const USER_ID = "b1000001-0001-4001-8001-000000000060"
const OTHER_USER = "b1000001-0001-4001-8001-000000000099"
const MURDER = "b1000001-0001-4001-8001-000000000011"
const WEAPON = "b1000001-0001-4001-8001-000000000021"
const MOTIVE = "b1000001-0001-4001-8001-000000000041"
const LOCATION = "b1000001-0001-4001-8001-000000000031"
const OTHER_SUSPECT = "b1000001-0001-4001-8001-000000000012"

const solution: AccusationSolution = {
  murderId: MURDER,
  weaponId: WEAPON,
  motiveId: MOTIVE,
  locationId: LOCATION,
}

function createLedger(stored: AccusationSolution | null) {
  const attempts: SubmitAccusationInput[] = []
  let solved = false
  let solutionReads = 0

  return {
    attempts,
    solutionReads: () => solutionReads,
    submit: async (
      input: SubmitAccusationInput,
    ): Promise<AccusationDecision> => {
      const attemptsUsed = attempts.length
      const alreadySolved = solved
      const readSolution = shouldReadSolution({ alreadySolved, attemptsUsed })
      if (readSolution) {
        solutionReads += 1
      }
      const decision = decideAccusation({
        alreadySolved,
        attemptsUsed,
        solution: readSolution ? stored : null,
        guess: input.guess,
      })
      if (decision.type === "record") {
        attempts.push(input)
        if (decision.solved) {
          solved = true
        }
      }
      return decision
    },
  }
}

function post(
  body: unknown,
  deps: {
    userId?: string | null
    ledger: ReturnType<typeof createLedger>
  },
  gameId = GAME_ID,
) {
  const request = new Request(`http://localhost/api/game/${gameId}/result`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  return handleAccusationPost(request, gameId, {
    getSessionUserId: async () => deps.userId ?? null,
    submitAccusation: deps.ledger.submit,
  })
}

function accusation(overrides?: {
  gameId?: string
  murderId?: string
  userId?: string
}) {
  return {
    game_id: overrides?.gameId ?? GAME_ID,
    user_id: overrides?.userId ?? OTHER_USER,
    time_taken: 1000,
    answer: {
      murder_id: overrides?.murderId ?? OTHER_SUSPECT,
      weapon_id: WEAPON,
      motive_id: MOTIVE,
      location_id: LOCATION,
    },
  }
}

describe("handleAccusationPost", () => {
  it("rejects an unauthenticated call before reading the solution", async () => {
    const ledger = createLedger(solution)
    const response = await post(accusation({ murderId: MURDER }), {
      userId: null,
      ledger,
    })
    const body = await response.json()

    assert.equal(response.status, 401)
    assert.equal(body.success, false)
    assert.equal(body.data, null)
    assert.equal(body.message, "Sign in required")
    assert.equal(ledger.attempts.length, 0)
    assert.equal(ledger.solutionReads(), 0)
    assert.equal(JSON.stringify(body).includes(MURDER), false)
  })

  it("returns only solved or not solved for a recorded attempt", async () => {
    const ledger = createLedger(solution)
    const response = await post(accusation(), {
      userId: USER_ID,
      ledger,
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(response.headers.get("cache-control"), "no-store")
    assert.equal(body.success, true)
    assert.deepEqual(Object.keys(body.data).sort(), [
      "alreadySolved",
      "attemptLimit",
      "attemptsRemaining",
      "attemptsUsed",
      "solved",
    ])
    assert.equal(body.data.solved, false)
    assert.equal(body.data.alreadySolved, false)
    assert.equal(body.data.attemptsUsed, 1)
    assert.equal(body.data.attemptsRemaining, ACCUSATION_ATTEMPT_LIMIT - 1)
    assert.equal(body.data.attemptLimit, ACCUSATION_ATTEMPT_LIMIT)
    assert.equal(ledger.attempts.length, 1)
    assert.equal(ledger.attempts[0]?.userId, USER_ID)
    assert.equal(JSON.stringify(body).includes(MURDER), false)
    assert.equal("murder" in body.data, false)
  })

  it("records a full match and stops grading later guesses", async () => {
    const ledger = createLedger(solution)
    const solvedResponse = await post(accusation({ murderId: MURDER }), {
      userId: USER_ID,
      ledger,
    })
    const solvedBody = await solvedResponse.json()
    const later = await post(accusation(), {
      userId: USER_ID,
      ledger,
    })
    const laterBody = await later.json()

    assert.equal(solvedResponse.status, 200)
    assert.equal(solvedBody.data.solved, true)
    assert.equal(solvedBody.data.alreadySolved, false)
    assert.equal(later.status, 200)
    assert.equal(laterBody.data.solved, true)
    assert.equal(laterBody.data.alreadySolved, true)
    assert.equal(laterBody.data.attemptsUsed, 1)
    assert.equal(ledger.attempts.length, 1)
    assert.equal(ledger.solutionReads(), 1)
  })

  it("stops grading after the attempt cap, including a correct guess", async () => {
    const ledger = createLedger(solution)

    for (let index = 0; index < ACCUSATION_ATTEMPT_LIMIT; index += 1) {
      const response = await post(accusation(), {
        userId: USER_ID,
        ledger,
      })
      const body = await response.json()
      assert.equal(response.status, 200)
      assert.equal(body.data.solved, false)
      assert.equal(body.data.attemptsUsed, index + 1)
    }

    const blocked = await post(accusation({ murderId: MURDER }), {
      userId: USER_ID,
      ledger,
    })
    const blockedBody = await blocked.json()

    assert.equal(blocked.status, 429)
    assert.equal(blockedBody.success, false)
    assert.equal(blockedBody.data, null)
    assert.equal(blockedBody.message, "Accusation limit reached")
    assert.equal(ledger.attempts.length, ACCUSATION_ATTEMPT_LIMIT)
    assert.equal(ledger.solutionReads(), ACCUSATION_ATTEMPT_LIMIT)
    assert.equal(JSON.stringify(blockedBody).includes(MURDER), false)
    assert.equal(JSON.stringify(blockedBody).includes("solved"), false)
  })

  it("strips per-field flags if a decision carries them", async () => {
    const response = await handleAccusationPost(
      new Request(`http://localhost/api/game/${GAME_ID}/result`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(accusation()),
      }),
      GAME_ID,
      {
        getSessionUserId: async () => USER_ID,
        submitAccusation: async () => {
          const decision = decideAccusation({
            alreadySolved: false,
            attemptsUsed: 0,
            solution,
            guess: {
              murderId: OTHER_SUSPECT,
              weaponId: WEAPON,
              motiveId: MOTIVE,
              locationId: LOCATION,
            },
          })
          if (decision.type !== "record") {
            return decision
          }
          return {
            ...decision,
            result: {
              ...decision.result,
              murder: true,
              weapon: false,
              motive: true,
              location: false,
            },
          } as AccusationDecision
        },
      },
    )
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal("murder" in body.data, false)
    assert.equal("weapon" in body.data, false)
    assert.equal("motive" in body.data, false)
    assert.equal("location" in body.data, false)
  })

  it("rejects a body that does not match the route id", async () => {
    const ledger = createLedger(solution)
    const response = await post(
      accusation({
        gameId: "b1000001-0001-4001-8001-000000000002",
      }),
      { userId: USER_ID, ledger },
    )

    assert.equal(response.status, 400)
    assert.equal(ledger.attempts.length, 0)
    assert.equal(ledger.solutionReads(), 0)
  })

  it("rejects invalid JSON from a signed-in player", async () => {
    const ledger = createLedger(solution)
    const response = await handleAccusationPost(
      new Request(`http://localhost/api/game/${GAME_ID}/result`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
      GAME_ID,
      {
        getSessionUserId: async () => USER_ID,
        submitAccusation: ledger.submit,
      },
    )

    assert.equal(response.status, 400)
    assert.equal(ledger.solutionReads(), 0)
  })
})
