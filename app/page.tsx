import Link from "next/link";
import { ArrowRight, CircleHelp, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-6">
      <div className="w-full rounded-3xl border border-line bg-panel p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <div className="rounded-xl bg-primary p-2 text-white">
              <Rocket className="h-5 w-5" />
            </div>
            BucketList
          </div>
          <CircleHelp className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Collaborative Planning</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
            Check off your dreams,
            <br />
            <span className="text-primary">together.</span>
          </h1>
          <p className="mt-3 text-slate-600">Create, share, and complete bucket list goals with friends and family.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/signup">
            <Button className="w-full" size="lg">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="w-full justify-center border border-line bg-white text-slate-800">
              Log In
            </Button>
          </Link>
        </div>

        <div className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Log In
            </Link>
          </p>
          <p className="mt-4 text-xs text-slate-400">By continuing, you agree to the Terms and Privacy Policy.</p>
        </div>
      </div>
    </main>
  );
}
