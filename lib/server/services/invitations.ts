import { connectToDatabase } from "@/lib/db/mongoose";
import { env } from "@/lib/env";
import { sendInvitationEmail } from "@/lib/email";
import { InvitationModel } from "@/models/Invitation";
import { BucketListModel } from "@/models/BucketList";
import { UserModel } from "@/models/User";
import { logActivity } from "@/lib/server/activity";
import { createInvitationToken, hashInvitationToken } from "@/lib/server/invitations";
import { findListWithAccess } from "@/lib/server/list-access";
import { forbidden, gone, notFound, unauthorized } from "@/lib/server/api/errors";
import { assertValidObjectId } from "@/lib/server/api/object-id";

type InvitationRole = "EDITOR" | "VIEWER";

type CreateInvitationInput = {
  listId: string;
  senderId: string;
  recipient: string;
  role: InvitationRole;
};

type AcceptInvitationInput = {
  listId: string;
  userId: string;
  token: string;
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveRecipientEmail = async (recipient: string): Promise<string> => {
  if (recipient.includes("@")) {
    return recipient.toLowerCase();
  }

  const matchedUser = await UserModel.findOne({
    name: { $regex: `^${escapeRegex(recipient)}$`, $options: "i" }
  }).lean();

  if (!matchedUser) {
    throw notFound("Recipient email or username not found");
  }

  return matchedUser.email.toLowerCase();
};

export const createListInvitation = async ({ listId, senderId, recipient, role }: CreateInvitationInput): Promise<{
  id: string;
  recipientEmail: string;
  role: InvitationRole;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: Date;
  acceptUrl?: string;
}> => {
  await connectToDatabase();
  assertValidObjectId(listId, "listId");
  assertValidObjectId(senderId, "senderId");

  const found = await findListWithAccess(listId, senderId);
  if (!found) {
    throw notFound("List not found");
  }

  if (found.role !== "OWNER") {
    throw forbidden("Forbidden");
  }

  const recipientEmail = await resolveRecipientEmail(recipient.trim());
  const token = createInvitationToken();
  const tokenHash = hashInvitationToken(token);

  const invitation = await InvitationModel.create({
    listId: found.list._id,
    senderId,
    recipientEmail,
    role,
    tokenHash,
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });

  const acceptUrl = `${env.APP_URL}/invitations/accept?token=${token}&listId=${found.list._id.toString()}`;
  const sender = await UserModel.findById(senderId).lean();

  await sendInvitationEmail({
    to: recipientEmail,
    inviterName: sender?.name ?? "A collaborator",
    listTitle: found.list.title,
    acceptUrl
  });

  await logActivity({
    listId: found.list._id.toString(),
    actorId: senderId,
    action: "INVITATION_SENT",
    itemTitle: recipientEmail
  });

  return {
    id: invitation._id.toString(),
    recipientEmail,
    role: invitation.role as InvitationRole,
    status: invitation.status as "pending" | "accepted" | "expired" | "revoked",
    expiresAt: invitation.expiresAt,
    acceptUrl: process.env.NODE_ENV === "production" ? undefined : acceptUrl
  };
};

export const acceptListInvitation = async ({ listId, userId, token }: AcceptInvitationInput): Promise<{
  success: true;
  listId: string;
  role: InvitationRole;
}> => {
  await connectToDatabase();
  assertValidObjectId(listId, "listId");
  assertValidObjectId(userId, "userId");

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw unauthorized("Unauthorized");
  }

  const tokenHash = hashInvitationToken(token);
  const invitation = await InvitationModel.findOne({
    listId,
    tokenHash,
    status: "pending"
  });

  if (!invitation) {
    throw notFound("Invitation not found");
  }

  if (invitation.expiresAt.getTime() < Date.now()) {
    invitation.status = "expired";
    await invitation.save();
    throw gone("Invitation has expired");
  }

  if (invitation.recipientEmail.toLowerCase() !== user.email.toLowerCase()) {
    throw forbidden("Invitation recipient mismatch");
  }

  const list = await BucketListModel.findById(listId);
  if (!list) {
    throw notFound("List not found");
  }

  if (list.owner.toString() !== userId) {
    const nextCollaborators = list.collaborators.filter(
      (entry: { user: { toString(): string }; role: InvitationRole }) => entry.user.toString() !== userId
    );
    nextCollaborators.push({ user: user._id, role: invitation.role });
    list.collaborators = nextCollaborators;
  }

  await list.save();

  invitation.status = "accepted";
  await invitation.save();

  const accepted = {
    listId: list._id.toString(),
    role: invitation.role as InvitationRole,
    actorName: user.name
  };

  await logActivity({
    listId: accepted.listId,
    actorId: userId,
    action: "COLLABORATOR_JOINED",
    itemTitle: accepted.actorName
  });

  return {
    success: true,
    listId: accepted.listId,
    role: accepted.role
  };
};
