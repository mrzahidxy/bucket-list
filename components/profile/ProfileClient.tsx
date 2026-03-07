"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Snackbar } from "@/components/ui/Snackbar";
import { apiFetch, RequestError } from "@/lib/client/api";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type ListSummary = {
  id: string;
  collaborators: { user: string; role: "OWNER" | "EDITOR" | "VIEWER" }[];
  totalItems: number;
  completedItems: number;
};

export const ProfileClient = (): React.JSX.Element => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        setLoading(true);
        const [me, myLists] = await Promise.all([apiFetch<User>("/api/auth/me"), apiFetch<ListSummary[]>("/api/lists")]);
        setUser(me);
        setName(me.name);
        setAvatarUrl(me.avatarUrl ?? "");
        setLists(myLists);
      } catch (error) {
        setSnackbar({
          message: error instanceof RequestError ? error.message : "Failed to load profile",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    run().catch(() => undefined);
  }, []);

  const stats = useMemo(() => {
    const completed = lists.reduce((sum, list) => sum + list.completedItems, 0);
    const collaborators = new Set(lists.flatMap((list) => list.collaborators.map((c) => c.user))).size;

    return {
      buckets: lists.length,
      completed,
      collaborators
    };
  }, [lists]);

  const logout = async (): Promise<void> => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      setSnackbar({ message: error instanceof RequestError ? error.message : "Logout failed", type: "error" });
    }
  };

  const saveProfile = async (): Promise<void> => {
    if (!user) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedAvatar = avatarUrl.trim();
    const nextAvatar = trimmedAvatar.length > 0 ? trimmedAvatar : null;

    if (trimmedName.length < 2) {
      setSnackbar({ message: "Name must be at least 2 characters", type: "error" });
      return;
    }

    const payload: { name?: string; avatarUrl?: string | null } = {};
    if (trimmedName !== user.name) {
      payload.name = trimmedName;
    }

    if (nextAvatar !== (user.avatarUrl ?? null)) {
      payload.avatarUrl = nextAvatar;
    }

    if (Object.keys(payload).length === 0) {
      setSnackbar({ message: "No changes to save", type: "success" });
      return;
    }

    try {
      setSaving(true);
      const updated = await apiFetch<User>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      setUser(updated);
      setName(updated.name);
      setAvatarUrl(updated.avatarUrl ?? "");
      setSnackbar({ message: "Profile updated", type: "success" });
    } catch (error) {
      setSnackbar({ message: error instanceof RequestError ? error.message : "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onAvatarSelected = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      setSnackbar({ message: "Please upload a PNG, JPG, or WEBP image", type: "error" });
      return;
    }

    if (file.size > 1_500_000) {
      setSnackbar({ message: "Image must be 1.5MB or smaller", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setSnackbar({ message: "Failed to read image file", type: "error" });
        return;
      }

      setAvatarUrl(reader.result);
    };
    reader.onerror = () => setSnackbar({ message: "Failed to read image file", type: "error" });
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <main className="page-shell">
        <Loader size="lg" text="Loading profile..." />
      </main>
    );
  }

  return (
    <main className="page-shell max-w-3xl space-y-4 pb-24 md:pb-8">
      <header className="rounded-2xl border border-line bg-panel p-4">
        <h1 className="font-[var(--font-sora)] text-3xl font-bold">Profile</h1>
      </header>

      <Card className="text-center">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`${user?.name ?? "User"} avatar`}
            className="mx-auto mb-3 h-24 w-24 rounded-full border-4 border-white object-cover shadow-soft"
          />
        ) : (
          <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-200 text-2xl font-bold text-slate-700 shadow-soft">
            {user?.name?.[0]}
          </div>
        )}
        <h2 className="text-4xl font-bold text-text">{user?.name}</h2>
        <p className="text-muted">{user?.email}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-sm text-muted">Buckets</p>
            <p className="text-3xl font-bold">{stats.buckets}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-sm text-muted">Completed</p>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-sm text-muted">Collaborators</p>
            <p className="text-3xl font-bold">{stats.collaborators}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Profile Settings</p>
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-text">
            Name
          </label>
          <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="profile-avatar-url" className="mb-1 block text-sm font-medium text-text">
            Avatar URL
          </label>
          <Input
            id="profile-avatar-url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarSelected} className="h-auto py-2" />
          <Button variant="ghost" type="button" onClick={() => setAvatarUrl("")}>Remove image</Button>
        </div>
        <Button className="w-full" size="lg" onClick={saveProfile} loading={saving}>
          Save profile
        </Button>
      </Card>

      <Button className="w-full" size="lg" onClick={logout}>
        <LogOut className="h-4 w-4" /> Logout
      </Button>

      <Snackbar message={snackbar?.message ?? null} type={snackbar?.type} onClose={() => setSnackbar(null)} />
    </main>
  );
};
