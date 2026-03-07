export type ListItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
};

export type ListResponse = {
  id: string;
  title: string;
  description: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  items: ListItem[];
};

export type Collaborator = {
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type CollaboratorsResponse = {
  collaborators: Collaborator[];
};
