import { IGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { AppResponse } from "@/features/type";
import { publicApiFailure } from "@/lib/public-api-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}
import { NextRequest } from "next/server";
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!id) {
    const response = publicApiFailure(
      "GET /api/game/[id]",
      new Error("Missing game id"),
      "Invalid request",
      false,
    );
    return Response.json(response, { status: 400 });
  }
  console.log(id);
  try {
    const game = await gameServices.getById(id);
    const response: AppResponse<IGame> = {
      data: game,
      success: true,
      message: null,
    };
    return Response.json(response, { status: 200 });
  } catch (e) {
    const response: AppResponse<boolean> = publicApiFailure(
      "GET /api/game/[id]",
      e,
      "Could not load this case",
      false,
    );
    return Response.json(response, { status: 500 });
  }
}

