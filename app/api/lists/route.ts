import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ok } from "@/lib/api-response";
import { BucketListModel, BucketListDocument } from "@/models/BucketList";
import { ListItemModel } from "@/models/ListItem";
import { createListSchema } from "@/lib/validators/lists";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { withApiRoute } from "@/lib/server/api/handler";
import { parseJsonBody } from "@/lib/server/api/request";

export const GET = withApiRoute(async (request: NextRequest) => {
  const userId = requireRequestUserId(request);

  await connectToDatabase();

  const lists: BucketListDocument[] = await BucketListModel.find({
    $or: [{ owner: userId }, { "collaborators.user": userId }]
  })
    .sort({ updatedAt: -1 })
    .lean<BucketListDocument[]>();

  const listIds = lists.map((l) => l._id);

  const stats = await ListItemModel.aggregate<{ _id: Types.ObjectId; total: number; completed: number }>([
    { $match: { listId: { $in: listIds } } },
    {
      $group: {
        _id: "$listId",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$completed", true] }, 1, 0]
          }
        }
      }
    }
  ]);

  const statMap = new Map(stats.map((s) => [s._id.toString(), s]));

  return ok(
    lists.map((list) => {
      const stat = statMap.get(list._id.toString());
      const total = stat?.total ?? 0;
      const completed = stat?.completed ?? 0;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        id: list._id.toString(),
        title: list.title,
        description: list.description ?? "",
        owner: list.owner.toString(),
        collaborators: list.collaborators.map((collab) => ({
          user: collab.user.toString(),
          role: collab.role
        })),
        totalItems: total,
        completedItems: completed,
        progress,
        updatedAt: list.updatedAt
      };
    })
  );
});

export const POST = withApiRoute(async (request: NextRequest) => {
  const userId = requireRequestUserId(request);
  const body = await parseJsonBody(request, createListSchema, "Invalid list payload");

  await connectToDatabase();

  const list = await BucketListModel.create({
    title: body.title,
    description: body.description,
    owner: userId,
    collaborators: []
  });

  return ok(
    {
      id: list._id.toString(),
      title: list.title,
      description: list.description ?? "",
      owner: list.owner.toString()
    },
    201
  );
});
