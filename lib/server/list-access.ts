import { Types } from "mongoose";
import { BucketListModel } from "@/models/BucketList";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { getRoleForUser } from "@/lib/server/access";
import type { CollaboratorRole } from "@/types";

export type ListWithAccess = {
  list: {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    owner: Types.ObjectId;
    collaborators: Array<{ user: Types.ObjectId; role: CollaboratorRole }>;
    createdAt: Date;
    updatedAt: Date;
  };
  role: CollaboratorRole | null;
};

export const findListWithAccess = async (listId: string, userId: string): Promise<ListWithAccess | null> => {
  assertValidObjectId(listId, "listId");
  const list = await BucketListModel.findById(listId).lean<ListWithAccess["list"] | null>();

  if (!list) {
    return null;
  }

  const role = getRoleForUser(list, userId);

  return {
    list,
    role
  };
};
