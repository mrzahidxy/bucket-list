import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { ok } from "@/lib/api-response";
import { ListItemModel } from "@/models/ListItem";
import { BucketListModel } from "@/models/BucketList";
import { updateListSchema } from "@/lib/validators/lists";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { notFound } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { requireEditableList, requireOwnedList, requireViewableList } from "@/lib/server/api/list-guards";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { parseJsonBody, resolveParams } from "@/lib/server/api/request";

type ListItemRecord = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type UpdatedListRecord = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
};

export const GET = withApiRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = requireRequestUserId(request);

  const { id } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  const found = await requireViewableList(id, userId);

  const items = await ListItemModel.find({ listId: id }).sort({ createdAt: -1 }).lean<ListItemRecord[]>();

  return ok({
    id: found.list._id.toString(),
    title: found.list.title,
    description: found.list.description ?? "",
    role: found.role,
    collaborators: found.list.collaborators.map((entry) => ({
      user: entry.user.toString(),
      role: entry.role
    })),
    items: items.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description ?? "",
      completed: item.completed,
      dueDate: item.dueDate,
      assignedTo: item.assignedTo ? item.assignedTo.toString() : null,
      createdBy: item.createdBy.toString(),
      completedAt: item.completedAt ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  });
});

export const PATCH = withApiRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = requireRequestUserId(request);
  const { id } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  const body = await parseJsonBody(request, updateListSchema, "Invalid list payload");

  await requireEditableList(id, userId);

  const updated = await BucketListModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...(body.title ? { title: body.title } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "description")
          ? { description: body.description ?? undefined }
          : {})
      }
    },
    { new: true }
  ).lean<UpdatedListRecord | null>();

  if (!updated) {
    throw notFound("List not found");
  }

  return ok({
    id: updated._id.toString(),
    title: updated.title,
    description: updated.description ?? ""
  });
});

export const DELETE = withApiRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = requireRequestUserId(request);
  const { id } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  await requireOwnedList(id, userId);

  await Promise.all([BucketListModel.deleteOne({ _id: id }), ListItemModel.deleteMany({ listId: id })]);

  return ok({ success: true });
});
