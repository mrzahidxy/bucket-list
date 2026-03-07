import { connectToDatabase } from "@/lib/db/mongoose";
import { canEditList, canViewList } from "@/lib/permissions";
import { forbidden, notFound } from "@/lib/server/api/errors";
import { findListWithAccess } from "@/lib/server/list-access";
import type { ListWithAccess } from "@/lib/server/list-access";

export const requireListWithAccess = async (listId: string, userId: string): Promise<ListWithAccess> => {
  await connectToDatabase();

  const found = await findListWithAccess(listId, userId);
  if (!found) {
    throw notFound("List not found");
  }

  return found;
};

export const requireViewableList = async (listId: string, userId: string): Promise<ListWithAccess> => {
  const found = await requireListWithAccess(listId, userId);
  if (!canViewList(found.role)) {
    throw forbidden("Forbidden");
  }

  return found;
};

export const requireEditableList = async (listId: string, userId: string): Promise<ListWithAccess> => {
  const found = await requireListWithAccess(listId, userId);
  if (!canEditList(found.role)) {
    throw forbidden("Forbidden");
  }

  return found;
};

export const requireOwnedList = async (listId: string, userId: string): Promise<ListWithAccess> => {
  const found = await requireListWithAccess(listId, userId);
  if (found.role !== "OWNER") {
    throw forbidden("Forbidden");
  }

  return found;
};
