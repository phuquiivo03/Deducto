import { handleAccusationPost } from "@/features/game/accusation.handler";
import accusationRepositories from "@/features/submission/accusation.repositories";
import { getSessionUserId } from "@/features/user/user.auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handleAccusationPost(request, id, {
    getSessionUserId,
    submitAccusation: accusationRepositories.submit,
  });
}
