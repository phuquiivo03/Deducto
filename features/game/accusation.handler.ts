import { z } from "zod";

import type { AppResponse } from "@/features/type";
import { resultResponseSchema } from "@/features/game/game.schemas";
import {
  type AccusationDecision,
  type AccusationPublicResult,
  type SubmitAccusationInput,
} from "@/features/game/accusation-decision";

const accusationBodySchema = z.object({
  game_id: z.string().uuid(),
  time_taken: z.number().int().nonnegative(),
  answer: z.object({
    murder_id: z.string().uuid(),
    weapon_id: z.string().uuid(),
    motive_id: z.string().uuid(),
    location_id: z.string().uuid(),
  }),
});

export interface AccusationHandlerDeps {
  getSessionUserId: () => Promise<string | null>;
  submitAccusation: (
    input: SubmitAccusationInput,
  ) => Promise<AccusationDecision>;
}

const NO_STORE = { "cache-control": "no-store" } as const;

/**
 * POST /api/game/[id]/result.
 * Requires a session, records the guess, and returns only the whole-tuple verdict.
 */
export async function handleAccusationPost(
  request: Request,
  gameId: string,
  deps: AccusationHandlerDeps,
): Promise<Response> {
  try {
    const sessionUserId = await deps.getSessionUserId();
    if (!sessionUserId) {
      return appJson(
        { data: null, success: false, message: "Sign in required" },
        401,
      );
    }

    const routeId = parseUuid(gameId);
    if (!routeId) {
      return appJson(
        { data: null, success: false, message: "Invalid accusation" },
        400,
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return appJson(
        { data: null, success: false, message: "Invalid accusation" },
        400,
      );
    }

    const parsed = accusationBodySchema.safeParse(json);
    if (!parsed.success) {
      return appJson(
        { data: null, success: false, message: "Invalid accusation" },
        400,
      );
    }

    const bodyGameId = parsed.data.game_id.toLowerCase();
    if (bodyGameId !== routeId) {
      return appJson(
        {
          data: null,
          success: false,
          message: "Accusation does not match this case",
        },
        400,
      );
    }

    const decision = await deps.submitAccusation({
      userId: sessionUserId.toLowerCase(),
      gameId: routeId,
      timeTaken: parsed.data.time_taken,
      guess: {
        murderId: parsed.data.answer.murder_id.toLowerCase(),
        weaponId: parsed.data.answer.weapon_id.toLowerCase(),
        motiveId: parsed.data.answer.motive_id.toLowerCase(),
        locationId: parsed.data.answer.location_id.toLowerCase(),
      },
    });

    return responseForDecision(decision);
  } catch (error) {
    console.error("accusation result failed", error);
    return appJson(
      {
        data: null,
        success: false,
        message: "Không thể ghi nhận cáo buộc",
      },
      500,
    );
  }
}

function responseForDecision(decision: AccusationDecision): Response {
  if (decision.type === "missing") {
    return appJson(
      { data: null, success: false, message: "Case not found" },
      404,
    );
  }

  if (decision.type === "limit") {
    return appJson(
      {
        data: null,
        success: false,
        message: "Accusation limit reached",
      },
      429,
    );
  }

  const data = publicResult(decision.result);
  return appJson({ data, success: true, message: null }, 200);
}

function publicResult(result: AccusationPublicResult): AccusationPublicResult {
  return resultResponseSchema.parse({
    solved: result.solved,
    alreadySolved: result.alreadySolved,
    attemptsUsed: result.attemptsUsed,
    attemptsRemaining: result.attemptsRemaining,
    attemptLimit: result.attemptLimit,
  });
}

function parseUuid(value: string): string | null {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data.toLowerCase();
}

function appJson<T>(body: AppResponse<T>, status: number): Response {
  return Response.json(body, { status, headers: NO_STORE });
}
