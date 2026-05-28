import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { signPasswordResetToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongoose";
import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertRateLimit } from "@/lib/server/api/rate-limit";
import { parseJsonBody } from "@/lib/server/api/request";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { UserModel } from "@/models/User";

const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

export const POST = withApiRoute(async (request: NextRequest) => {
  assertRateLimit(request, "forgot-password", 5, 60_000);
  const body = await parseJsonBody(request, forgotPasswordSchema, "Invalid email");

  await connectToDatabase();

  const user = await UserModel.findOne({ email: body.email }).lean();

  if (user) {
    const token = signPasswordResetToken(user._id.toString());
    const resetUrl = `${env.APP_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl
    }).catch((error) => {
      console.error("[forgot-password-email-error]", error);
    });
  }

  return ok({ message: GENERIC_MESSAGE });
});
