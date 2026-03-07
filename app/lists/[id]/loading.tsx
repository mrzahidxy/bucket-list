import { Loader } from "@/components/ui/Loader";

export default function ListLoading(): React.JSX.Element {
  return (
    <div className="page-shell">
      <Loader size="lg" text="Loading list details..." />
    </div>
  );
}
