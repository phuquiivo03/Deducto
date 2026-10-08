import { handleCreateGamePost } from "@/features/game/create-game.handler";
import gameServices from "@/features/game/game.services";
import { getSessionUserId } from "@/features/user/user.auth";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { publicApiFailure } from "@/lib/public-api-error";

export async function POST(request: Request) {
  try {
    return await handleCreateGamePost(request, {
      getSessionUserId,
      createGame: (input, creatorId) =>
        gameServices.create(input, creatorId),
    });
  } catch (error) {
    const response = publicApiFailure(
      "POST /api/game",
      error,
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
