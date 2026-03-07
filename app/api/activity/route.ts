import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ok } from "@/lib/api-response";
import { ActivityModel } from "@/models/Activity";
import { BucketListModel } from "@/models/BucketList";
import { UserModel } from "@/models/User";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { withApiRoute } from "@/lib/server/api/handler";

type ActivityAction = "INVITATION_SENT" | "COLLABORATOR_JOINED" | "ITEM_COMPLETED" | "ITEM_UNCOMPLETED";

type ListSummaryRecord = {
  _id: Types.ObjectId;
  title: string;
};

type ActivityRecord = {
  _id: Types.ObjectId;
  listId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: ActivityAction;
  itemTitle?: string | null;
  createdAt: Date;
};

type ActorRecord = {
  _id: Types.ObjectId;
  name: string;
};

const getActivityLabel = (action: string, itemTitle?: string | null): string => {
  if (action === "INVITATION_SENT") {
    return `sent invitation to ${itemTitle ?? "a collaborator"}`;
  }

  if (action === "COLLABORATOR_JOINED") {
    return "joined the list";
  }

  if (action === "ITEM_COMPLETED") {
    return `checked task \"${itemTitle ?? "Untitled"}\"`;
  }

  if (action === "ITEM_UNCOMPLETED") {
    return `unchecked task \"${itemTitle ?? "Untitled"}\"`;
  }

  return "updated activity";
};

export const GET = withApiRoute(async (request: NextRequest) => {
  const userId = requireRequestUserId(request);
  await connectToDatabase();

  const lists = await BucketListModel.find({
    $or: [{ owner: userId }, { "collaborators.user": userId }]
  })
    .select({ _id: 1, title: 1 })
    .lean<ListSummaryRecord[]>();

  if (lists.length === 0) {
    return ok([]);
  }

  const listIds = lists.map((list) => list._id);
  const listTitleById = new Map(lists.map((list) => [list._id.toString(), list.title]));

  const activities = await ActivityModel.find({ listId: { $in: listIds } })
    .where("action")
    .in(["INVITATION_SENT", "COLLABORATOR_JOINED", "ITEM_COMPLETED", "ITEM_UNCOMPLETED"])
    .sort({ createdAt: -1 })
    .limit(30)
    .lean<ActivityRecord[]>();

  const actorIds = Array.from(new Set(activities.map((entry) => entry.actorId.toString())));
  const actors = await UserModel.find({ _id: { $in: actorIds } })
    .select({ _id: 1, name: 1 })
    .lean<ActorRecord[]>();
  const actorById = new Map(actors.map((actor) => [actor._id.toString(), actor.name]));

  const activity = activities
    .map((entry) => ({
      id: entry._id.toString(),
      listId: entry.listId.toString(),
      listTitle: listTitleById.get(entry.listId.toString()) ?? "Unknown list",
      actorId: entry.actorId.toString(),
      actorName: actorById.get(entry.actorId.toString()) ?? "Someone",
      action: entry.action,
      label: getActivityLabel(entry.action, entry.itemTitle ?? null),
      createdAt: entry.createdAt
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return ok(activity);
});
