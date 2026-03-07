"use client";

import { useState } from "react";
import { Copy, Mail, Trash2, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch, RequestError } from "@/lib/client/api";

type Collaborator = {
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  name: string;
  email: string;
  avatarUrl: string | null;
};

type ShareModalProps = {
  listId: string;
  listTitle: string;
  open: boolean;
  canManage: boolean;
  collaborators: Collaborator[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
  showMessage: (message: string, type?: "success" | "error") => void;
};

export const ShareModal = ({
  listId,
  listTitle,
  open,
  canManage,
  collaborators,
  onClose,
  onUpdated,
  showMessage
}: ShareModalProps): React.JSX.Element => {
  const [recipient, setRecipient] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [sending, setSending] = useState(false);

  const sharePath = `/lists/${listId}`;

  const invite = async (): Promise<void> => {
    try {
      setSending(true);
      const response = await apiFetch<{ acceptUrl?: string }>(`/api/lists/${listId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ recipient, role })
      });
      await onUpdated();
      setRecipient("");
      showMessage(response.acceptUrl ? `Invite sent. Dev link: ${response.acceptUrl}` : "Invitation sent.");
    } catch (error) {
      showMessage(error instanceof RequestError ? error.message : "Failed to send invite", "error");
    } finally {
      setSending(false);
    }
  };

  const updateRole = async (userId: string, nextRole: "EDITOR" | "VIEWER"): Promise<void> => {
    try {
      await apiFetch(`/api/lists/${listId}/collaborators/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole })
      });
      await onUpdated();
      showMessage("Role updated");
    } catch (error) {
      showMessage(error instanceof RequestError ? error.message : "Failed to update role", "error");
    }
  };

  const removeCollaborator = async (userId: string): Promise<void> => {
    try {
      await apiFetch(`/api/lists/${listId}/collaborators/${userId}`, { method: "DELETE" });
      await onUpdated();
      showMessage("Collaborator removed");
    } catch (error) {
      showMessage(error instanceof RequestError ? error.message : "Failed to remove collaborator", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Collaborate on ${listTitle}`} subtitle="Share your journey with friends">
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-slate-600">ADD PEOPLE</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Enter email or username"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="pl-9"
                disabled={!canManage}
              />
            </div>
            <select
              className="h-11 rounded-xl border border-line bg-white px-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
              disabled={!canManage}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <Button onClick={invite} loading={sending} disabled={!recipient.trim() || !canManage}>
              <UserPlus className="h-4 w-4" /> Invite
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-600">WHO HAS ACCESS</h3>
            <p className="text-sm text-muted">{collaborators.length} Members</p>
          </div>
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-200 font-semibold text-slate-700">
                    {collab.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text">{collab.name}</p>
                    <p className="truncate text-sm text-muted">{collab.email}</p>
                  </div>
                </div>
                <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
                  {collab.role === "OWNER" ? (
                    <span className="rounded-full bg-primarySoft px-3 py-1 text-sm font-semibold text-primary">Owner</span>
                  ) : (
                    <>
                      <select
                        value={collab.role}
                        onChange={(e) => updateRole(collab.userId, e.target.value as "EDITOR" | "VIEWER")}
                        className="h-9 rounded-lg border border-line bg-white px-2 text-sm"
                        disabled={!canManage}
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        title="Remove collaborator"
                        aria-label={`Remove ${collab.name}`}
                        disabled={!canManage}
                        onClick={() => removeCollaborator(collab.userId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-line pt-4 ">
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-slate-600">SHARE VIA LINK</h3>
            <div className="flex items-center rounded-xl border border-line bg-white px-3 py-2">
              <input readOnly value={sharePath} className="flex-1 text-sm text-muted outline-none" />
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
                    showMessage("Copied link");
                  } catch {
                    showMessage("Copy failed", "error");
                  }
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};
