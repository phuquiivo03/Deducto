/**
 * Accusation budget and verdict rules for the result endpoint.
 *
 * Cases have 3, 4, or 5 entities per category. Per-field booleans
 * identify an easy case in two guesses, so the public verdict is only
 * whether the whole accusation solved the case. Five recorded attempts
 * is far below the 81 / 256 / 625 possible tuples.
 */
export const ACCUSATION_ATTEMPT_LIMIT = 5

export interface AccusationGuess {
  murderId: string
  weaponId: string
  motiveId: string
  locationId: string
}

export interface SubmitAccusationInput {
  userId: string
  gameId: string
  guess: AccusationGuess
  timeTaken: number
}

export interface AccusationSolution {
  murderId: string
  weaponId: string
  motiveId: string
  locationId: string
}

export interface AccusationPublicResult {
  solved: boolean
  alreadySolved: boolean
  attemptsUsed: number
  attemptsRemaining: number
  attemptLimit: number
}

export type AccusationDecision =
  | { type: "already-solved"; result: AccusationPublicResult }
  | { type: "limit"; attemptsUsed: number; attemptLimit: number }
  | { type: "missing" }
  | { type: "record"; solved: boolean; result: AccusationPublicResult }

export function shouldReadSolution(input: {
  alreadySolved: boolean
  attemptsUsed: number
  attemptLimit?: number
}): boolean {
  const attemptLimit = input.attemptLimit ?? ACCUSATION_ATTEMPT_LIMIT
  return !input.alreadySolved && input.attemptsUsed < attemptLimit
}

/**
 * Choose the public verdict. Solved cases and exhausted budgets are
 * decided before the guess is compared, so those calls are not an oracle.
 */
export function decideAccusation(input: {
  alreadySolved: boolean
  attemptsUsed: number
  solution: AccusationSolution | null
  guess: AccusationGuess
  attemptLimit?: number
}): AccusationDecision {
  const attemptLimit = input.attemptLimit ?? ACCUSATION_ATTEMPT_LIMIT
  const attemptsRemaining = Math.max(0, attemptLimit - input.attemptsUsed)

  if (input.alreadySolved) {
    return {
      type: "already-solved",
      result: {
        solved: true,
        alreadySolved: true,
        attemptsUsed: input.attemptsUsed,
        attemptsRemaining,
        attemptLimit,
      },
    }
  }

  if (input.attemptsUsed >= attemptLimit) {
    return {
      type: "limit",
      attemptsUsed: input.attemptsUsed,
      attemptLimit,
    }
  }

  if (!input.solution) {
    return { type: "missing" }
  }

  const solved = tupleMatches(input.solution, input.guess)
  const attemptsUsed = input.attemptsUsed + 1

  return {
    type: "record",
    solved,
    result: {
      solved,
      alreadySolved: false,
      attemptsUsed,
      attemptsRemaining: attemptLimit - attemptsUsed,
      attemptLimit,
    },
  }
}

function tupleMatches(
  solution: AccusationSolution,
  guess: AccusationGuess,
): boolean {
  return (
    solution.murderId === guess.murderId &&
    solution.weaponId === guess.weaponId &&
    solution.motiveId === guess.motiveId &&
    solution.locationId === guess.locationId
  )
}
