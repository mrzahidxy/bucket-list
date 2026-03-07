"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch, RequestError } from "@/lib/client/api";

export default function AcceptInvitationPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const listId = searchParams.get("listId") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (!token || !listId) {
        setStatus("error");
        setMessage("Missing invitation token.");
        return;
      }

      try {
        setStatus("loading");
        await apiFetch<{ success: true }>("/api/invitations/accept", {
          method: "POST",
          body: JSON.stringify({ token, listId })
        });
        setStatus("success");
        setMessage("Invitation accepted. You can now access the list.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof RequestError ? error.message : "Unable to accept invitation");
      }
    };

    run().catch(() => undefined);
  }, [token, listId]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Card className="w-full text-center">
        <h1 className="font-[var(--font-sora)] text-3xl font-bold text-text">Invitation</h1>
        <p className="mt-2 text-muted">
          {status === "loading" ? "Accepting invitation..." : message || "Processing invitation..."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Log in</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
