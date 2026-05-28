import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth/password";
import { verifyPasswordResetToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongoose";
import { badRequest } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertRateLimit } from "@/lib/server/api/rate-limit";
import { parseJsonBody } from "@/lib/server/api/request";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { UserModel } from "@/models/User";

export const POST = withApiRoute(async (request: NextRequest) => {
  assertRateLimit(request, "reset-password", 10, 60_000);
  const body = await parseJsonBody(request, resetPasswordSchema, "Invalid reset payload");

  const payload = (() => {
    try {
      return verifyPasswordResetToken(body.token);
    } catch {
      throw badRequest("Invalid or expired reset token");
    }
  })();

  await connectToDatabase();

  const user = await UserModel.findById(payload.sub);
  if (!user) {
    throw badRequest("Invalid or expired reset token");
  }

  user.passwordHash = await hashPassword(body.password);
  await user.save();

  return ok({ success: true });
});
