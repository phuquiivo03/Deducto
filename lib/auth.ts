import { NextRequest } from "next/server";
import { getSessionUserId } from "@/features/user/user.auth";

export const requireAuth = async (): Promise<string | null> => {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return null;
  }
  return sessionUserId;
};
