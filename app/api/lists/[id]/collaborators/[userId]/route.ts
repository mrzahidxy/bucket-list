import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { updateCollaboratorRoleSchema } from "@/lib/validators/invitations";
import { BucketListModel } from "@/models/BucketList";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { badRequest, notFound } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { requireOwnedList } from "@/lib/server/api/list-guards";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { parseJsonBody, resolveParams } from "@/lib/server/api/request";

export const PATCH = withApiRoute(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) => {
  const actingUserId = requireRequestUserId(request);
  const body = await parseJsonBody(request, updateCollaboratorRoleSchema, "Invalid role payload");
  const { id, userId } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  assertValidObjectId(userId, "userId");
  const found = await requireOwnedList(id, actingUserId);

  if (found.list.owner.toString() === userId) {
    throw badRequest("Owner role cannot be changed");
  }

  const updated = await BucketListModel.findOneAndUpdate(
    { _id: id, "collaborators.user": userId },
    { $set: { "collaborators.$.role": body.role } },
    { new: true }
  ).lean();

  if (!updated) {
    throw notFound("Collaborator not found");
  }

  return ok({ success: true });
});

export const DELETE = withApiRoute(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) => {
  const actingUserId = requireRequestUserId(request);
  const { id, userId } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  assertValidObjectId(userId, "userId");
  const found = await requireOwnedList(id, actingUserId);

  if (found.list.owner.toString() === userId) {
    throw badRequest("Owner cannot be removed");
  }

  const result = await BucketListModel.updateOne({ _id: id }, { $pull: { collaborators: { user: userId } } });

  return ok({
    success: true,
    removed: result.modifiedCount > 0
  });
});
