import { NextRequest } from "next/server";
import { getRequestUserId } from "@/lib/server/auth-guard";
import { unauthorized } from "@/lib/server/api/errors";
import { isValidObjectId } from "@/lib/server/api/object-id";

export const requireRequestUserId = (request: NextRequest): string => {
  const userId = getRequestUserId(request);
  if (!userId || !isValidObjectId(userId)) {
    throw unauthorized("Unauthorized");
  }

  return userId;
};
