import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { parseJsonBody } from "@/lib/server/api/request";
import { acceptInvitationSchema } from "@/lib/validators/invitations";
import { acceptListInvitation } from "@/lib/server/services/invitations";

export const POST = withApiRoute(async (request: NextRequest) => {
  const userId = requireRequestUserId(request);
  const body = await parseJsonBody(request, acceptInvitationSchema, "Invalid invitation token");
  assertValidObjectId(body.listId, "listId");

  const result = await acceptListInvitation({
    userId,
    listId: body.listId,
    token: body.token
  });

  return ok(result);
});
