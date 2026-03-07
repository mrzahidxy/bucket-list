import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/models/User";
import { updateProfileSchema } from "@/lib/validators/auth";
import { getSession } from "@/lib/auth/session";
import { ok } from "@/lib/api-response";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { notFound, unauthorized } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { parseJsonBody } from "@/lib/server/api/request";

export const GET = withApiRoute(async () => {
  const session = await getSession();

  if (!session) {
    throw unauthorized("Unauthorized");
  }

  return ok(session);
});

export const PATCH = withApiRoute(async (request: NextRequest) => {
  const userId = requireRequestUserId(request);
  const body = await parseJsonBody(request, updateProfileSchema, "Invalid profile payload");

  const updateFields: { name?: string; avatarUrl?: string | null } = {};

  if (body.name !== undefined) {
    updateFields.name = body.name;
  }

  if (body.avatarUrl !== undefined) {
    updateFields.avatarUrl = body.avatarUrl;
  }

  await connectToDatabase();
  const updated = await UserModel.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).lean();

  if (!updated) {
    throw notFound("User not found");
  }

  return ok({
    id: updated._id.toString(),
    email: updated.email,
    name: updated.name,
    avatarUrl: updated.avatarUrl ?? null
  });
});
