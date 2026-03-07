"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge, Handshake, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { apiFetch, RequestError } from "@/lib/client/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type ListSummary = {
  id: string;
  title: string;
  description: string;
  owner: string;
  progress: number;
};

type ActivityEntry = {
  id: string;
  listId: string;
  listTitle: string;
  actorId: string;
  actorName: string;
  action: string;
  label: string;
  createdAt: string;
};

const formatTimeAgo = (isoDate: string): string => {
  const now = Date.now();
  const ts = new Date(isoDate).getTime();

  if (Number.isNaN(ts)) {
    return "recently";
  }

  const diff = Math.max(0, now - ts);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const TRACKED_ACTIVITY = new Set(["INVITATION_SENT", "COLLABORATOR_JOINED", "ITEM_COMPLETED", "ITEM_UNCOMPLETED"]);

export const ActivitySummaryClient = (): React.JSX.Element => {
  const [me, setMe] = useState<User | null>(null);
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const [meData, listsData, activityData] = await Promise.all([
          apiFetch<User>("/api/auth/me"),
          apiFetch<ListSummary[]>("/api/lists"),
          apiFetch<ActivityEntry[]>("/api/activity")
        ]);

        setMe(meData);
        setLists(listsData);
        setActivity(activityData);
      } catch (e) {
        setError(e instanceof RequestError ? e.message : "Failed to load dashboard summary");
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(() => undefined);
  }, []);

  useEffect(() => {
    setVisibleCount(10);
  }, [activity]);

  const totalLists = useMemo(() => {
    if (!me) {
      return 0;
    }

    return lists.filter((list) => list.owner === me.id).length;
  }, [lists, me]);

  const totalCollaborations = useMemo(() => {
    if (!me) {
      return 0;
    }

    return lists.filter((list) => list.owner !== me.id).length;
  }, [lists, me]);

  const overallProgress = useMemo(() => {
    if (lists.length === 0) {
      return 0;
    }

    const total = lists.reduce((sum, list) => sum + list.progress, 0);
    return Math.round(total / lists.length);
  }, [lists]);

  const recentActivity = useMemo(() => {
    return activity
      .filter((entry) => TRACKED_ACTIVITY.has(entry.action))
      .slice(0, visibleCount)
      .map((entry) => {
        const actor = me && entry.actorId === me.id ? "You" : entry.actorName;
        return {
          id: entry.id,
          text: `${actor} ${entry.label} in "${entry.listTitle}" ${formatTimeAgo(entry.createdAt)}`
        };
      });
  }, [activity, me, visibleCount]);

  const totalTracked = useMemo(
    () => activity.filter((entry) => TRACKED_ACTIVITY.has(entry.action)).length,
    [activity]
  );

  return (
    <main className="page-shell">
      <header className="mb-6 rounded-2xl border border-line bg-panel p-4">
        <h1 className="text-4xl font-bold text-text">Dashboard</h1>
        <p className="mt-1 text-muted">Your list ownership, collaborations, and recent activity.</p>
      </header>

      {loading ? (
        <Card className="flex justify-center py-6">
          <Loader variant="dots" text="Loading summary..." />
        </Card>
      ) : null}
      {error ? <Card className="text-center text-red-600">{error}</Card> : null}

      {!loading && !error ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">My Lists</p>
              </div>
              <p className="text-4xl font-bold text-text">{totalLists}</p>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Collaborations</p>
              </div>
              <p className="text-4xl font-bold text-text">{totalCollaborations}</p>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Overall Progress</p>
              </div>
              <p className="text-4xl font-bold text-text">{overallProgress}%</p>
            </div>
          </Card>
        </section>
      ) : null}

      {!loading && !error ? (
        <section className="mt-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primarySoft">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text">Recent Activity</h2>
            </div>
            <div className="mt-3 space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted">No recent activity yet.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="rounded-xl border border-line bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {item.text}
                  </div>
                ))
              )}
            </div>
            {recentActivity.length < totalTracked ? (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-text hover:bg-slate-50"
                  onClick={() => setVisibleCount((count) => count + 10)}
                >
                  Show more
                </button>
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}
    </main>
  );
};
