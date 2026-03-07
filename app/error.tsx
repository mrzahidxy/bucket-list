"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error: _error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  void _error;

  return (
    <div className="page-shell">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
      <p className="text-muted">An unexpected error occurred.</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
