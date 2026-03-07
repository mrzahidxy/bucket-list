import { Loader } from "@/components/ui/Loader";

export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="page-shell">
      <Loader size="lg" text="Loading dashboard..." />
    </div>
  );
}
