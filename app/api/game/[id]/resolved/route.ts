import gameServices from "@/features/game/game.services";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!id) throw new Error("Game Id not found");
  const resolved = await gameServices.isResolved("sampleIds", id);
  return Response.json({
    data: resolved,
    success: true,
    message: null,
  });
}
