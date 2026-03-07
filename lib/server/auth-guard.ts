import { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export const getRequestUserId = (request: NextRequest): string | null => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifySessionToken(token);
    return payload.sub;
  } catch {
    return null;
  }
};
