import { Loader } from "@/components/ui/Loader";

export default function BucketsLoading(): React.JSX.Element {
  return (
    <div className="page-shell">
      <Loader size="lg" text="Loading buckets..." />
    </div>
  );
}
