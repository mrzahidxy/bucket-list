"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Snackbar } from "@/components/ui/Snackbar";
import { apiFetch, RequestError } from "@/lib/client/api";

type ListSummary = {
  id: string;
  title: string;
  description: string;
  owner: string;
  progress: number;
  collaborators: { user: string; role: "OWNER" | "EDITOR" | "VIEWER" }[];
  updatedAt: string;
};

export const BucketsClient = (): React.JSX.Element => {
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchLists = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<ListSummary[]>("/api/lists");
      setLists(data);
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Failed to load lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists().catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    if (!lists) return []
    if (!search.trim()) {
      return lists;
    }

    const q = search.toLowerCase();
    return lists.filter((list) => list.title.toLowerCase().includes(q) || list.description.toLowerCase().includes(q));
  }, [lists, search]);

  const createList = async (): Promise<void> => {
    try {
      setSaving(true);
      const created = await apiFetch<{ id: string; title: string; description: string; owner: string }>("/api/lists", {
        method: "POST",
        body: JSON.stringify({ title: newTitle, description: newDescription || undefined })
      });

      setLists((prev) => [
        {
          ...created,
          progress: 0,
          collaborators: [],
          updatedAt: new Date().toISOString()
        },
        ...prev
      ]);

      setCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setSnackbar({ message: "List created", type: "success" });
    } catch (e) {
      setSnackbar({ message: e instanceof RequestError ? e.message : "Failed to create list", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell">
      <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text">My Buckets</h1>
          <p className="mt-1 text-muted">Manage your personal and shared bucket lists.</p>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lists..." className="pl-9" />
          </div>
          <Button onClick={() => setCreateOpen(true)} className="whitespace-nowrap">
            <Plus className="h-4 w-4" /> Create List
          </Button>
        </div>
      </header>

      {loading ? (
        <Card className="flex justify-center py-6">
          <Loader variant="dots" text="Loading lists..." />
        </Card>
      ) : null}
      {error ? <Card className="text-center text-red-600">{error}</Card> : null}
      {!loading && !error && filtered.length === 0 ? (
        <Card className="text-center">
          <p className="text-lg font-semibold text-text">No lists found</p>
          <p className="text-sm text-muted">Create your first bucket list to get started.</p>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((list) => (
          <Card key={list.id} className="h-full transition hover:-translate-y-1 hover:shadow-lg">
            <Link href={`/lists/${list.id}`} className="block">
              <h2 className="text-3xl font-bold text-text">{list.title}</h2>
              <p className="line-clamp-2 text-sm text-muted">{list.description || "No description"}</p>
              <p className="mt-3 text-sm text-muted">Progress {list.progress}%</p>
              <ProgressBar value={list.progress} className="mt-2" />
            </Link>
            <div className="mt-4 flex items-center justify-between">
              <AvatarStack users={Array.from({ length: Math.max(1, list.collaborators.length) }).map((_, i) => ({ name: `C${i + 1}` }))} />
              <span className="rounded-full bg-primarySoft px-3 py-1 text-sm font-semibold text-primary">
                {list.collaborators.length > 0 ? `${list.collaborators.length} collaborators` : "Personal"}
              </span>
            </div>
          </Card>
        ))}
      </section>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New List"
        subtitle="Start a list and invite collaborators later."
      >
        <div className="space-y-3">
          <Input placeholder="List title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createList} loading={saving} disabled={!newTitle.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <Snackbar message={snackbar?.message ?? null} type={snackbar?.type} onClose={() => setSnackbar(null)} />
    </main>
  );
};
