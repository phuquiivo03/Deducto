import gameServices from "@/features/game/game.services";
import { getSessionUserId } from "@/features/user/user.auth";
import { publicApiFailure } from "@/lib/public-api-error";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      const response = publicApiFailure(
        "GET /api/game/[id]/resolved",
        new Error("Missing game id"),
        "Invalid request",
        false,
      );
      return Response.json(response, { status: 400 });
    }
    const userId = await getSessionUserId();
    const resolved = userId
      ? await gameServices.isResolved(userId, id)
      : false;
    return Response.json({
      data: resolved,
      success: true,
      message: null,
    });
  } catch (e) {
    const response = publicApiFailure(
      "GET /api/game/[id]/resolved",
      e,
      "Could not load solve status",
      false,
    );
    return Response.json(response, { status: 500 });
  }
}
