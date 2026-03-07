import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { createItemSchema } from "@/lib/validators/items";
import { ListItemModel } from "@/models/ListItem";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { withApiRoute } from "@/lib/server/api/handler";
import { requireEditableList } from "@/lib/server/api/list-guards";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { parseJsonBody, resolveParams } from "@/lib/server/api/request";

export const POST = withApiRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = requireRequestUserId(request);
  const body = await parseJsonBody(request, createItemSchema, "Invalid item payload");
  const { id } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  await requireEditableList(id, userId);

  const item = await ListItemModel.create({
    listId: id,
    title: body.title,
    description: body.description,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    assignedTo: body.assignedTo || undefined,
    createdBy: userId,
    completed: false
  });

  return ok(
    {
      id: item._id.toString(),
      title: item.title,
      description: item.description ?? "",
      completed: item.completed,
      dueDate: item.dueDate ?? null,
      assignedTo: item.assignedTo?.toString() ?? null,
      createdBy: item.createdBy.toString(),
      completedAt: item.completedAt ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    },
    201
  );
});
