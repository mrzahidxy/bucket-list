"use client";

import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error: _error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  void _error;

  return (
    <div className="page-shell">
      <h2 className="text-2xl font-bold text-red-600">Dashboard failed to load</h2>
      <p className="text-muted">Try again to recover this page.</p>
      <Button onClick={reset} className="mt-4">
        Retry
      </Button>
    </div>
  );
}
