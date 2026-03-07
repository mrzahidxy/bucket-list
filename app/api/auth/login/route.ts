import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { loginSchema } from "@/lib/validators/auth";
import { UserModel } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { signSessionToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { ok } from "@/lib/api-response";
import { badRequest, unauthorized } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertRateLimit } from "@/lib/server/api/rate-limit";
import { parseJsonBody } from "@/lib/server/api/request";

export const POST = withApiRoute(async (request: NextRequest) => {
  assertRateLimit(request, "login", 10, 60_000);
  const body = await parseJsonBody(request, loginSchema, "Invalid credentials");

  await connectToDatabase();

  const user = await UserModel.findOne({ email: body.email });
  if (!user) {
    throw unauthorized("Invalid credentials");
  }

  if (!user.passwordHash) {
    throw badRequest("This account uses Google sign-in");
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    throw unauthorized("Invalid credentials");
  }

  const token = signSessionToken({ sub: user._id.toString(), email: user.email });
  await setAuthCookie(token);

  return ok({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null
  });
});
