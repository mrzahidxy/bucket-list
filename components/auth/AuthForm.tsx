"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Snackbar } from "@/components/ui/Snackbar";
import { apiFetch, RequestError } from "@/lib/client/api";

type AuthFormProps = {
  mode: "login" | "signup";
  showForgotPasswordLink?: boolean;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdApi = {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (
    element: HTMLElement,
    options: { theme: "outline"; size: "large"; shape: "pill"; text: "signup_with" | "signin_with"; width: number }
  ) => void;
};

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: GoogleIdApi;
    };
  };
};

export const AuthForm = ({ mode, showForgotPasswordLink = false }: AuthFormProps): React.JSX.Element => {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isSignup = mode === "signup";
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) {
      setGoogleUnavailable(true);
      return;
    }

    const onGoogleCredential = async (credential: string): Promise<void> => {
      try {
        setGoogleLoading(true);
        await apiFetch<{ id: string }>("/api/auth/google", {
          method: "POST",
          body: JSON.stringify({ credential })
        });

        setSnackbar({ message: "Logged in with Google", type: "success" });
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        const message = error instanceof RequestError ? error.message : "Google authentication failed";
        setSnackbar({ message, type: "error" });
      } finally {
        setGoogleLoading(false);
      }
    };

    const initializeGoogle = (): void => {
      const g = (window as GoogleWindow).google;
      if (!g?.accounts?.id || !googleButtonRef.current) {
        setGoogleUnavailable(true);
        return;
      }

      googleButtonRef.current.innerHTML = "";

      g.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setSnackbar({ message: "Google authentication failed", type: "error" });
            return;
          }

          onGoogleCredential(response.credential).catch(() => undefined);
        }
      });

      g.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: isSignup ? "signup_with" : "signin_with",
        width: 340
      });

      setGoogleReady(true);
      setGoogleUnavailable(false);
    };

    const existing = (window as GoogleWindow).google;
    if (existing?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      setGoogleUnavailable(true);
      setSnackbar({ message: "Failed to load Google sign-in", type: "error" });
    };
    document.head.appendChild(script);
  }, [googleClientId, isSignup, router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      setLoading(true);
      await apiFetch<{ id: string }>(`/api/auth/${isSignup ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
      });

      setSnackbar({ message: isSignup ? "Account created" : "Logged in", type: "success" });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof RequestError ? error.message : "Authentication failed";
      setSnackbar({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-6">
      <div className="w-full rounded-3xl border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-text">{isSignup ? "Create account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted">
          {isSignup ? "Start your collaborative bucket journey." : "Sign in to continue to your lists."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {isSignup ? (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivers" required />
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
          {!isSignup && showForgotPasswordLink ? (
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs font-semibold text-primary">
                Forgot Password?
              </Link>
            </div>
          ) : null}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {isSignup ? "Sign up" : "Log in"}
          </Button>
        </form>

        {googleClientId && !googleUnavailable ? (
          <div className="mt-3 space-y-2">
            <div className="flex justify-center" ref={googleButtonRef} />
            {!googleReady ? <Loader size="sm" variant="dots" text="Loading Google sign-in..." className="justify-center" /> : null}
            {googleLoading ? <Loader size="sm" variant="dots" text="Completing Google login..." className="justify-center" /> : null}
          </div>
        ) : (
          <p className="mt-3 text-center text-xs text-muted">
            Google sign-in is unavailable right now. Continue with email and password.
          </p>
        )}

        <div className="mt-5 text-center text-sm text-muted">
          {isSignup ? "Already have an account?" : "New here?"} {" "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-primary">
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </div>
      </div>

      <Snackbar message={snackbar?.message ?? null} type={snackbar?.type} onClose={() => setSnackbar(null)} />
    </div>
  );
};
