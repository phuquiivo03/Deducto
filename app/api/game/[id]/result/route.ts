import { sampleResult } from "@/data/sample-be";
import type { IResult } from "@/types/apiDto";
export async function POST(request: Request) {
  const answer = (await request.json()) as IResult;
  if (answer.game_id !== sampleResult.game_id) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }
  if (answer.anwser.murder_id !== sampleResult.anwser.murder_id) {
    return Response.json({ error: "Answer not found" }, { status: 404 });
  }
  if (answer.anwser.weapon_id !== sampleResult.anwser.weapon_id) {
    return Response.json({ error: "Answer not found" }, { status: 404 });
  }
  if (answer.anwser.motive_id !== sampleResult.anwser.motive_id) {
    return Response.json({ error: "Answer not found" }, { status: 404 });
  }
  if (answer.anwser.location_id !== sampleResult.anwser.location_id) {
    return Response.json({ error: "Answer not found" }, { status: 404 });
  }
  return Response.json({ success: true });
}
