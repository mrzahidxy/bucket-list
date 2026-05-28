"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Snackbar } from "@/components/ui/Snackbar";
import { apiFetch, RequestError } from "@/lib/client/api";

const GENERIC_SUCCESS_MESSAGE = "If an account exists for that email, a reset link has been sent.";

type ForgotPasswordResponse = {
  message: string;
};

export default function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      setLoading(true);
      await apiFetch<ForgotPasswordResponse>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });

      setSubmitted(true);
      setSnackbar({ message: GENERIC_SUCCESS_MESSAGE, type: "success" });
    } catch (error) {
      const message = error instanceof RequestError ? error.message : "Unable to process request";
      setSnackbar({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-6">
      <div className="w-full rounded-3xl border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-text">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">Enter your account email and we&apos;ll send a reset link.</p>

        {submitted ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-line bg-white p-4 text-sm text-muted">{GENERIC_SUCCESS_MESSAGE}</p>
            <Link href="/login">
              <Button size="lg" className="w-full">
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Send reset link
            </Button>
            <div className="text-center text-sm text-muted">
              Remembered your password?{" "}
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
}
