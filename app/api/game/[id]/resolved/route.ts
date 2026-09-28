import gameServices from "@/features/game/game.services";
import { getSessionUserId } from "@/features/user/user.auth";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!id) throw new Error("Game Id not found");
  const userId = await getSessionUserId();
  const resolved = userId
    ? await gameServices.isResolved(userId, id)
    : false;
  return Response.json({
    data: resolved,
    success: true,
    message: null,
  });
}
