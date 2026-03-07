import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid list id");

export const createInvitationSchema = z.object({
  recipient: z.string().trim().min(3).max(120),
  role: z.enum(["EDITOR", "VIEWER"])
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(10),
  listId: objectIdSchema
});

export const updateCollaboratorRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"])
});
