import type { CollaboratorRole } from "@/types";

type ListAccessShape = {
  owner: { toString(): string } | string;
  collaborators: Array<{ user: { toString(): string } | string; role: CollaboratorRole }>;
};

const idToString = (value: { toString(): string } | string) =>
  typeof value === "string" ? value : value.toString();

export const getRoleForUser = (list: ListAccessShape, userId: string): CollaboratorRole | null => {
  if (idToString(list.owner) === userId) {
    return "OWNER";
  }

  const collaborator = list.collaborators.find((entry) => idToString(entry.user) === userId);
  return collaborator?.role ?? null;
};
