import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { setAuthCookie } from "@/lib/auth/cookies";
import { signSessionToken } from "@/lib/auth/jwt";
import { ok } from "@/lib/api-response";
import { UserModel } from "@/models/User";
import { env } from "@/lib/env";
import { apiError, badRequest, unauthorized } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertRateLimit } from "@/lib/server/api/rate-limit";
import { readJsonBody } from "@/lib/server/api/request";

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
};

export const POST = withApiRoute(async (request: NextRequest) => {
  assertRateLimit(request, "google-auth", 20, 60_000);

  const googleClientId = env.GOOGLE_CLIENT_ID ?? env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw apiError(503, "Google auth is not configured");
  }

  const body = await readJsonBody<{ credential?: string }>(request, "Missing Google credential");
  const credential = body?.credential?.trim();

  if (!credential) {
    throw badRequest("Missing Google credential");
  }

  const tokenInfoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    { cache: "no-store" }
  ).catch(() => null);

  if (!tokenInfoResponse || !tokenInfoResponse.ok) {
    throw unauthorized("Invalid Google credential");
  }

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

  if (!tokenInfo.aud || tokenInfo.aud !== googleClientId) {
    throw unauthorized("Invalid Google audience");
  }

  if (!tokenInfo.sub || !tokenInfo.email || tokenInfo.email_verified !== "true") {
    throw unauthorized("Google account email is not verified");
  }

  await connectToDatabase();

  let user = await UserModel.findOne({ email: tokenInfo.email });

  if (!user) {
    user = await UserModel.create({
      email: tokenInfo.email,
      name: tokenInfo.name?.trim() || tokenInfo.email.split("@")[0],
      avatarUrl: tokenInfo.picture,
      authProvider: "google",
      googleId: tokenInfo.sub
    });
  } else {
    const update: Record<string, unknown> = {};

    if (!user.googleId) {
      update.googleId = tokenInfo.sub;
    }

    if (!user.avatarUrl && tokenInfo.picture) {
      update.avatarUrl = tokenInfo.picture;
    }

    if (!user.name && tokenInfo.name) {
      update.name = tokenInfo.name;
    }

    if (Object.keys(update).length > 0) {
      user = await UserModel.findByIdAndUpdate(user._id, { $set: update }, { new: true });
    }
  }

  if (!user) {
    throw apiError(500, "Unable to complete Google login");
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
