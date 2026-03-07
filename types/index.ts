export type CollaboratorRole = "OWNER" | "EDITOR" | "VIEWER";

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};
