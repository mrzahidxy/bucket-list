import { Loader } from "@/components/ui/Loader";

export default function InvitationAcceptLoading(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center p-6">
      <Loader size="lg" text="Loading invitation..." />
    </main>
  );
}
