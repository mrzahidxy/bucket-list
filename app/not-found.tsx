import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="page-shell text-center">
      <h1 className="text-5xl font-bold text-text">404</h1>
      <p className="mt-2 text-muted">Page not found.</p>
      <Link href="/dashboard">
        <Button className="mt-4">Back to dashboard</Button>
      </Link>
    </main>
  );
}
