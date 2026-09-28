import {
  answerSchema,
  type IAnswer,
  type IAnswerResponse,
} from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { AppResponse } from "@/features/type";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = answerSchema.safeParse(body);
    if (!parseResult.success) {
      throw new Error(parseResult.error.message);
    }
    const result = await gameServices.validateResult(parseResult.data);
    const response: AppResponse<IAnswerResponse> = {
      data: result,
      success: true,
      message: null,
    };
    return Response.json(response, { status: 200 });
  } catch (e) {
    const response: AppResponse<boolean> = {
      data: false,
      success: false,
      message: e instanceof Error ? e.message : "An unknown error occurred",
    };
    return Response.json(response, { status: 400 });
  }
}
