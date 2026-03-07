import type { PropsWithChildren } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { WebNavbar } from "@/components/layout/WebNavbar";

export default function DashboardLayout({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <WebNavbar />
      {children}
      <MobileBottomNav />
    </div>
  );
}
