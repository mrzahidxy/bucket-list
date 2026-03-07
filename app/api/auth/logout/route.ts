import { clearAuthCookie } from "@/lib/auth/cookies";
import { ok } from "@/lib/api-response";
import { withApiRoute } from "@/lib/server/api/handler";

export const POST = withApiRoute(async () => {
  await clearAuthCookie();
  return ok({ success: true });
});
