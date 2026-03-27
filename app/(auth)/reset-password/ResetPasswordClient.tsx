"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Snackbar } from "@/components/ui/Snackbar";
import { apiFetch, RequestError } from "@/lib/client/api";

type ResetPasswordClientProps = {
  token: string;
};

type ResetPasswordResponse = {
  success: boolean;
};

export const ResetPasswordClient = ({ token }: ResetPasswordClientProps): React.JSX.Element => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!token) {
      setSnackbar({ message: "Missing reset token", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await apiFetch<ResetPasswordResponse>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      setCompleted(true);
      setSnackbar({ message: "Password reset successfully", type: "success" });
    } catch (error) {
      const message = error instanceof RequestError ? error.message : "Unable to reset password";
      setSnackbar({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-6">
      <div className="w-full rounded-3xl border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-text">Reset password</h1>
        <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>

        {!token ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              This reset link is invalid or incomplete.
            </p>
            <Link href="/forgot-password">
              <Button size="lg" className="w-full">
                Request a new link
              </Button>
            </Link>
          </div>
        ) : completed ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              Your password has been updated. You can sign in with the new password now.
            </p>
            <Link href="/login">
              <Button size="lg" className="w-full">
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">New password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Reset password
            </Button>
            <div className="text-center text-sm text-muted">
              Back to{" "}
              <Link href="/login" className="font-semibold text-primary">
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>

      <Snackbar message={snackbar?.message ?? null} type={snackbar?.type} onClose={() => setSnackbar(null)} />
    </div>
  );
};
