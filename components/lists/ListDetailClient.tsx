"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Loader } from "@/components/ui/Loader";
import { Snackbar } from "@/components/ui/Snackbar";
import { ShareModal } from "@/components/lists/ShareModal";
import { EditItemModal } from "@/components/lists/EditItemModal";
import { EditListModal } from "@/components/lists/EditListModal";
import { ListItemsSection } from "@/components/lists/ListItemsSection";
import type { Collaborator, CollaboratorsResponse, ListItem, ListResponse } from "@/components/lists/types";
import { apiFetch, RequestError } from "@/lib/client/api";

export const ListDetailClient = ({ listId }: { listId: string }): React.JSX.Element => {
  const router = useRouter();
  const [list, setList] = useState<ListResponse | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updatingList, setUpdatingList] = useState(false);
  const [itemEditOpen, setItemEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemEditTitle, setItemEditTitle] = useState("");
  const [itemEditDescription, setItemEditDescription] = useState("");
  const [updatingItem, setUpdatingItem] = useState(false);
  const [deletingList, setDeletingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const canEdit = list?.role === "OWNER" || list?.role === "EDITOR";
  const canManage = list?.role === "OWNER";

  const showMessage = (message: string, type: "success" | "error" = "success"): void => {
    setSnackbar({ message, type });
  };

  const fetchList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const [listData, collaboratorData] = await Promise.all([
        apiFetch<ListResponse>(`/api/lists/${listId}`),
        apiFetch<CollaboratorsResponse>(`/api/lists/${listId}/collaborators`)
      ]);
      setList(listData);
      setCollaborators(collaboratorData.collaborators);
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Failed to load list");
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList().catch(() => undefined);
  }, [fetchList]);

  const progress = useMemo(() => {
    const total = list?.items.length ?? 0;
    const completed = list?.items.filter((item) => item.completed).length ?? 0;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [list?.items]);

  const addItem = async (): Promise<void> => {
    if (!newTitle.trim()) {
      return;
    }

    try {
      setSaving(true);
      const created = await apiFetch<ListItem>(`/api/lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify({ title: newTitle })
      });

      setList((prev) => (prev ? { ...prev, items: [created, ...prev.items] } : prev));
      setNewTitle("");
    } catch (e) {
      showMessage(e instanceof RequestError ? e.message : "Failed to add item", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = async (item: ListItem): Promise<void> => {
    try {
      const updated = await apiFetch<ListItem>(`/api/lists/${listId}/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !item.completed })
      });

      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((entry) => (entry.id === item.id ? updated : entry))
            }
          : prev
      );
    } catch (e) {
      showMessage(e instanceof RequestError ? e.message : "Failed to update item", "error");
    }
  };

  const openEditItem = (item: ListItem): void => {
    if (!canEdit) {
      return;
    }

    setEditingItemId(item.id);
    setItemEditTitle(item.title);
    setItemEditDescription(item.description ?? "");
    setItemEditOpen(true);
  };

  const saveItemEdit = async (): Promise<void> => {
    if (!editingItemId) {
      return;
    }

    const currentItem = list?.items.find((entry) => entry.id === editingItemId);
    if (!currentItem) {
      setItemEditOpen(false);
      setEditingItemId(null);
      return;
    }

    const title = itemEditTitle.trim();
    const description = itemEditDescription.trim();
    if (!title) {
      showMessage("Item title is required", "error");
      return;
    }

    const nextDescription = description.length > 0 ? description : null;
    const payload: { title?: string; description?: string | null } = {};

    if (title !== currentItem.title) {
      payload.title = title;
    }
    if (nextDescription !== (currentItem.description || null)) {
      payload.description = nextDescription;
    }
    if (Object.keys(payload).length === 0) {
      setItemEditOpen(false);
      setEditingItemId(null);
      return;
    }

    try {
      setUpdatingItem(true);
      const updated = await apiFetch<ListItem>(`/api/lists/${listId}/items/${editingItemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((entry) => (entry.id === editingItemId ? updated : entry))
            }
          : prev
      );
      setItemEditOpen(false);
      setEditingItemId(null);
    } catch (e) {
      showMessage(e instanceof RequestError ? e.message : "Failed to edit item", "error");
    } finally {
      setUpdatingItem(false);
    }
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    try {
      await apiFetch(`/api/lists/${listId}/items/${itemId}`, { method: "DELETE" });
      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((entry) => entry.id !== itemId)
            }
          : prev
      );
    } catch (e) {
      showMessage(e instanceof RequestError ? e.message : "Failed to delete item", "error");
    }
  };

  const openEditList = (): void => {
    if (!list || !canEdit) {
      return;
    }

    setEditTitle(list.title);
    setEditDescription(list.description ?? "");
    setEditOpen(true);
  };

  const editList = async (): Promise<void> => {
    if (!list || !canEdit) {
      return;
    }

    const title = editTitle.trim();
    const description = editDescription.trim();
    if (!title) {
      showMessage("List title is required", "error");
      return;
    }

    const nextDescription = description.length > 0 ? description : null;

    const payload: { title?: string; description?: string | null } = {};
    if (title !== list.title) {
      payload.title = title;
    }
    if (nextDescription !== (list.description || null)) {
      payload.description = nextDescription;
    }
    if (Object.keys(payload).length === 0) {
      return;
    }

    try {
      setUpdatingList(true);
      const updated = await apiFetch<{ id: string; title: string; description: string }>(`/api/lists/${list.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      setList((prev) => (prev ? { ...prev, title: updated.title, description: updated.description } : prev));
      setEditOpen(false);
      showMessage("List updated");
    } catch (e) {
      showMessage(e instanceof RequestError ? e.message : "Failed to update list", "error");
    } finally {
      setUpdatingList(false);
    }
  };

  const deleteList = async (): Promise<void> => {
    if (!list || !canManage) {
      return;
    }

    const confirmed = window.confirm(`Delete "${list.title}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingList(true);
      await apiFetch(`/api/lists/${list.id}`, { method: "DELETE" });
      showMessage("List deleted");
      router.push("/buckets");
      router.refresh();
    } catch (e) {
      showMessage(e instanceof RequestError ? e.message : "Failed to delete list", "error");
    } finally {
      setDeletingList(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <Loader size="lg" text="Loading list..." />
      </main>
    );
  }

  if (error || !list) {
    return <main className="page-shell text-red-600">{error ?? "List not found"}</main>;
  }

  return (
    <main className="page-shell space-y-4 pb-24 md:pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="rounded-full p-2 hover:bg-slate-100" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-[var(--font-sora)] text-4xl font-bold text-text">{list.title}</h1>
            {list.description ? <p className="text-sm text-muted">{list.description}</p> : null}
            <p className="text-sm text-muted">{collaborators.length} members collaborating</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={openEditList} disabled={!canEdit}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="ghost" onClick={deleteList} loading={deletingList} disabled={!canManage} className="text-red-600">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button onClick={() => setShareOpen(true)}>
            <Users className="h-4 w-4" /> Invite
          </Button>
        </div>
      </header>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-text">Adventure Progress</h2>
        <p className="mb-2 text-sm text-muted">
          You&apos;ve completed {list.items.filter((item) => item.completed).length} of {list.items.length} adventures.
        </p>
        <ProgressBar value={progress} />
      </Card>

      <ListItemsSection
        items={list.items}
        canEdit={Boolean(canEdit)}
        newTitle={newTitle}
        saving={saving}
        onNewTitleChange={setNewTitle}
        onAddItem={addItem}
        onToggleItem={toggleItem}
        onOpenEditItem={openEditItem}
        onDeleteItem={deleteItem}
      />

      <ShareModal
        listId={list.id}
        listTitle={list.title}
        open={shareOpen}
        canManage={Boolean(canManage)}
        collaborators={collaborators}
        onClose={() => setShareOpen(false)}
        onUpdated={fetchList}
        showMessage={showMessage}
      />

      <EditListModal
        open={editOpen}
        editTitle={editTitle}
        editDescription={editDescription}
        updatingList={updatingList}
        onClose={() => setEditOpen(false)}
        onEditTitleChange={setEditTitle}
        onEditDescriptionChange={setEditDescription}
        onSave={editList}
      />

      <EditItemModal
        open={itemEditOpen}
        title={itemEditTitle}
        description={itemEditDescription}
        updatingItem={updatingItem}
        onClose={() => {
          if (updatingItem) {
            return;
          }

          setItemEditOpen(false);
          setEditingItemId(null);
        }}
        onTitleChange={setItemEditTitle}
        onDescriptionChange={setItemEditDescription}
        onSave={saveItemEdit}
      />

      <Snackbar message={snackbar?.message ?? null} type={snackbar?.type} onClose={() => setSnackbar(null)} />
    </main>
  );
};
