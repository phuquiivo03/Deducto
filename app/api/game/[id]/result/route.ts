import {
  answerSchema,
  type IAnswer,
  type IAnswerResponse,
} from "@/features/game/game.schemas";
import { getSessionUserId } from "@/features/user/user.auth";
import gameServices from "@/features/game/game.services";
import { AppResponse } from "@/features/type";
import { publicApiFailure } from "@/lib/public-api-error";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = answerSchema.safeParse(body);
    if (!parseResult.success) {
      const response = publicApiFailure(
        "POST /api/game/[id]/result",
        parseResult.error,
        "Invalid request",
        false,
      );
      return Response.json(response, { status: 400 });
    }
    const sessionUserId = await getSessionUserId();
    const result = await gameServices.validateResult(
      parseResult.data,
      sessionUserId,
    );
    const response: AppResponse<IAnswerResponse> = {
      data: result,
      success: true,
      message: null,
    };
    return Response.json(response, { status: 200 });
  } catch (e) {
    const response: AppResponse<boolean> = publicApiFailure(
      "POST /api/game/[id]/result",
      e,
      "Could not check this accusation",
      false,
    );
    return Response.json(response, { status: 400 });
  }
}
