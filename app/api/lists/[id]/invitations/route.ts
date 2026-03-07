import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireRequestUserId } from "@/lib/server/api/auth";
import { withApiRoute } from "@/lib/server/api/handler";
import { assertValidObjectId } from "@/lib/server/api/object-id";
import { parseJsonBody, resolveParams } from "@/lib/server/api/request";
import { createInvitationSchema } from "@/lib/validators/invitations";
import { createListInvitation } from "@/lib/server/services/invitations";

export const POST = withApiRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = requireRequestUserId(request);
  const body = await parseJsonBody(request, createInvitationSchema, "Invalid invitation payload");
  const { id } = await resolveParams(params);
  assertValidObjectId(id, "listId");

  const invitation = await createListInvitation({
    listId: id,
    senderId: userId,
    recipient: body.recipient,
    role: body.role
  });

  return ok(invitation, 201);
});
