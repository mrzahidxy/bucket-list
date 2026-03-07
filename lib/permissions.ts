import type { CollaboratorRole } from "@/types";

export const canViewList = (role: CollaboratorRole | null): boolean => role !== null;
export const canEditList = (role: CollaboratorRole | null): boolean => role === "OWNER" || role === "EDITOR";
export const canManageCollaborators = (role: CollaboratorRole | null): boolean => role === "OWNER";
