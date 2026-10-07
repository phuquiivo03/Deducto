import {
  createGameInputSchema,
  type ICreateGameInput,
} from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { getSessionUserId } from "@/features/user/user.auth";
import { AppResponse } from "@/features/type";
import { NextRequest } from "next/server";
import { publishErrorStatus } from "@/features/game/game-errors";
import { requireAuth } from "@/lib/auth";
import { publicApiFailure } from "@/lib/public-api-error";

export async function POST(request: Request) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    const response: AppResponse<null> = {
      data: null,
      success: false,
      message: "Sign in required",
    };
    return Response.json(response, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = createGameInputSchema.safeParse(body);
    if (!parseResult.success) {
      const response: AppResponse<null> = publicApiFailure(
        "POST /api/game",
        parseResult.error,
        "Invalid request",
        null,
      );
      return Response.json(response, { status: 400 });
    }

    const id = await gameServices.create(
      parseResult.data as ICreateGameInput,
      sessionUserId,
    );

    const response: AppResponse<{ id: string }> = {
      data: { id },
      success: true,
      message: null,
    };
    return Response.json(response, { status: 201 });
  } catch (e) {
    const response: AppResponse<null> = publicApiFailure(
      "POST /api/game",
      e,
      "Không thể tạo trò chơi",
      null,
    );
    return Response.json(response, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionUserId = await requireAuth();
  const tab = req?.nextUrl?.searchParams.get("tab");
  if (tab == "public") {
    const games = await gameServices.findPublic();
    return Response.json({
      data: games,
      success: true,
      message: null,
    });
  }
  if (!sessionUserId) {
    return Response.json(
      {
        data: null,
        success: false,
        message: "Unauthorized",
      },
      { status: 403 },
    );
  }

  if (tab == "solved") {
    const games = await gameServices.findSolved(sessionUserId);
    return Response.json({
      data: games,
      success: true,
      message: null,
    });
  }
  if (tab == "my") {
    const games = await gameServices.findByUserId(sessionUserId);
    return Response.json({
      data: games,
      success: true,
      message: null,
    });
  }
}
