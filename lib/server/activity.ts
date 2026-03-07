import { Types } from "mongoose";
import { ActivityModel } from "@/models/Activity";

type ActivityAction =
  | "INVITATION_SENT"
  | "COLLABORATOR_JOINED"
  | "ITEM_COMPLETED"
  | "ITEM_UNCOMPLETED";

type LogActivityInput = {
  listId: string;
  actorId: string;
  action: ActivityAction;
  itemId?: string;
  itemTitle?: string;
};

export const logActivity = async ({ listId, actorId, action, itemId, itemTitle }: LogActivityInput): Promise<void> => {
  try {
    await ActivityModel.create({
      listId: new Types.ObjectId(listId),
      actorId: new Types.ObjectId(actorId),
      action,
      itemId: itemId ? new Types.ObjectId(itemId) : undefined,
      itemTitle: itemTitle || undefined
    });
  } catch {
    // Best effort only: activity logging should never block primary mutations.
  }
};
