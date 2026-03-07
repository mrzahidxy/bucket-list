import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { UserModel } from "@/models/User";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { withApiRoute } from "@/lib/server/api/handler";
import { requireViewableList } from "@/lib/server/api/list-guards";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { resolveParams } from "@/lib/server/api/request";

export const GET = withApiRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = requireRequestUserId(request);
  const { id } = await resolveParams(params);
  assertValidObjectId(id, "listId");
  const found = await requireViewableList(id, userId);

  const userIds = [found.list.owner.toString(), ...found.list.collaborators.map((c) => c.user.toString())];
  const users = await UserModel.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const deduped = new Map<
    string,
    {
      userId: string;
      role: "OWNER" | "EDITOR" | "VIEWER";
      name: string;
      email: string;
      avatarUrl: string | null;
    }
  >();

  const ownerId = found.list.owner.toString();
  const ownerUser = userMap.get(ownerId);
  deduped.set(ownerId, {
    userId: ownerId,
    role: "OWNER",
    name: ownerUser?.name ?? "Owner",
    email: ownerUser?.email ?? "",
    avatarUrl: ownerUser?.avatarUrl ?? null
  });

  for (const entry of found.list.collaborators) {
    const collaboratorId = entry.user.toString();
    if (deduped.has(collaboratorId)) {
      continue;
    }

    const user = userMap.get(collaboratorId);
    deduped.set(collaboratorId, {
      userId: collaboratorId,
      role: entry.role,
      name: user?.name ?? "Collaborator",
      email: user?.email ?? "",
      avatarUrl: user?.avatarUrl ?? null
    });
  }

  return ok({
    collaborators: Array.from(deduped.values())
  });
});
