import { prisma } from "@/lib/prisma"
import {
  ACCUSATION_ATTEMPT_LIMIT,
  decideAccusation,
  shouldReadSolution,
  type AccusationDecision,
  type AccusationGuess,
  type AccusationSolution,
  type SubmitAccusationInput,
} from "@/features/game/accusation-decision"

const submit = async (
  input: SubmitAccusationInput,
): Promise<AccusationDecision> => {
  const userId = input.userId.toLowerCase()
  const gameId = input.gameId.toLowerCase()
  const guess = normalizeGuess(input.guess)
  const lockKey = `${userId}:${gameId}`

  try {
    return await prisma.$transaction(async (tx) => {
      // The insert trigger takes this same transaction lock. Postgres
      // grants it again to the current transaction instead of waiting.
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0::bigint))
      `

      const existingSolve = await tx.userSubmission.findUnique({
        where: { userId_gameId: { userId, gameId } },
        select: { userId: true },
      })
      const attemptsUsed = await tx.accusationAttempt.count({
        where: { userId, gameId },
      })
      const alreadySolved = existingSolve !== null

      let solution: AccusationSolution | null = null
      if (shouldReadSolution({ alreadySolved, attemptsUsed })) {
        const row = await tx.result.findUnique({
          where: { gameId },
          select: {
            murderId: true,
            weaponId: true,
            motiveId: true,
            locationId: true,
          },
        })
        solution = row
          ? {
              murderId: row.murderId.toLowerCase(),
              weaponId: row.weaponId.toLowerCase(),
              motiveId: row.motiveId.toLowerCase(),
              locationId: row.locationId.toLowerCase(),
            }
          : null
      }

      const decision = decideAccusation({
        alreadySolved,
        attemptsUsed,
        solution,
        guess,
      })

      if (decision.type !== "record") {
        return decision
      }

      await tx.accusationAttempt.create({
        data: {
          userId,
          gameId,
          murderId: guess.murderId,
          weaponId: guess.weaponId,
          motiveId: guess.motiveId,
          locationId: guess.locationId,
          solved: decision.solved,
        },
      })

      if (decision.solved) {
        await tx.userSubmission.create({
          data: {
            userId,
            gameId,
            timeTaken: input.timeTaken,
          },
        })
      }

      return decision
    })
  } catch (error) {
    if (isAttemptLimitDbError(error)) {
      const attemptsUsed = await prisma.accusationAttempt.count({
        where: { userId, gameId },
      })
      return {
        type: "limit",
        attemptsUsed,
        attemptLimit: ACCUSATION_ATTEMPT_LIMIT,
      }
    }
    throw error
  }
}

function normalizeGuess(guess: AccusationGuess): AccusationGuess {
  return {
    murderId: guess.murderId.toLowerCase(),
    weaponId: guess.weaponId.toLowerCase(),
    motiveId: guess.motiveId.toLowerCase(),
    locationId: guess.locationId.toLowerCase(),
  }
}

function isAttemptLimitDbError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("accusation_attempt_limit")
  )
}

const accusationRepositories = {
  submit,
}

export default accusationRepositories
