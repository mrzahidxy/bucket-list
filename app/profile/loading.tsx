import { Loader } from "@/components/ui/Loader";

export default function ProfileLoading(): React.JSX.Element {
  return (
    <div className="page-shell">
      <Loader size="lg" text="Loading profile..." />
    </div>
  );
}
