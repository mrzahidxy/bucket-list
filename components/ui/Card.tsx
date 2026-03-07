import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card = ({ className, children }: CardProps): React.JSX.Element => {
  return <div className={cn("rounded-2xl border border-line bg-panel p-4 shadow-soft", className)}>{children}</div>;
};
