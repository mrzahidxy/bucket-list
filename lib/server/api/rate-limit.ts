import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/server/api/request";
import { tooManyRequests } from "@/lib/server/api/errors";

export const assertRateLimit = (request: NextRequest, keyPrefix: string, limit: number, windowMs: number): void => {
  const rate = checkRateLimit(`${keyPrefix}:${getRequestIp(request)}`, limit, windowMs);

  if (!rate.ok) {
    throw tooManyRequests("Too many requests");
  }
};
