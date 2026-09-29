import { IGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { AppResponse } from "@/features/type";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}
import { NextRequest } from "next/server";
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!id) throw new Error("Game Id not found");
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
    const response: AppResponse<boolean> = {
      data: false,
      success: false,
      message: e instanceof Error ? e.message : "An unknown error occurred",
    };
    return Response.json(response, { status: 500 });
  }
}

