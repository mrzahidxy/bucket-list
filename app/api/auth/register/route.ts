import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { registerSchema } from "@/lib/validators/auth";
import { UserModel } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { signSessionToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { ok } from "@/lib/api-response";
import { conflict } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertRateLimit } from "@/lib/server/api/rate-limit";
import { parseJsonBody } from "@/lib/server/api/request";

export const POST = withApiRoute(async (request: NextRequest) => {
  assertRateLimit(request, "register", 5, 60_000);
  const body = await parseJsonBody(request, registerSchema, "Invalid registration data");

  await connectToDatabase();

  const existing = await UserModel.findOne({ email: body.email }).lean();
  if (existing) {
    throw conflict("Email already in use");
  }

  const passwordHash = await hashPassword(body.password);
  const user = await UserModel.create({
    email: body.email,
    passwordHash,
    name: body.name,
    authProvider: "local"
  });

  const token = signSessionToken({ sub: user._id.toString(), email: user.email });
  await setAuthCookie(token);

  return ok(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null
    },
    201
  );
});
