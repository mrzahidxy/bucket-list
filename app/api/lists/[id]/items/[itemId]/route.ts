import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { ok } from "@/lib/api-response";
import { ListItemModel } from "@/models/ListItem";
import { updateItemSchema } from "@/lib/validators/items";
import { logActivity } from "@/lib/server/activity";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { notFound } from "@/lib/server/api/errors";
import { withApiRoute } from "@/lib/server/api/handler";
import { requireEditableList } from "@/lib/server/api/list-guards";
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

export const PATCH = withApiRoute(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) => {
  const userId = requireRequestUserId(request);

  const body = await parseJsonBody(request, updateItemSchema, "Invalid item payload");
  const { id, itemId } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  assertValidObjectId(itemId, "itemId");
  await requireEditableList(id, userId);

  const updateData: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    updateData.title = body.title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    updateData.description = body.description ?? undefined;
  }

  if (Object.prototype.hasOwnProperty.call(body, "assignedTo")) {
    updateData.assignedTo = body.assignedTo ?? undefined;
  }

  if (Object.prototype.hasOwnProperty.call(body, "dueDate")) {
    updateData.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
  }

  if (typeof body.completed === "boolean") {
    updateData.completed = body.completed;
    updateData.completedAt = body.completed ? new Date() : undefined;
  }

  const item = await ListItemModel.findOneAndUpdate({ _id: itemId, listId: id }, { $set: updateData }, { new: true }).lean<
    ListItemRecord | null
  >();

  if (!item) {
    throw notFound("Item not found");
  }

  if (typeof body.completed === "boolean") {
    await logActivity({
      listId: id,
      actorId: userId,
      action: body.completed ? "ITEM_COMPLETED" : "ITEM_UNCOMPLETED",
      itemId: item._id.toString(),
      itemTitle: item.title
    });
  }

  return ok({
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
  });
});

export const DELETE = withApiRoute(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) => {
  const userId = requireRequestUserId(request);
  const { id, itemId } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  assertValidObjectId(itemId, "itemId");
  await requireEditableList(id, userId);

  const result = await ListItemModel.deleteOne({ _id: itemId, listId: id });

  if (!result.deletedCount) {
    throw notFound("Item not found");
  }

  return ok({ success: true });
});
