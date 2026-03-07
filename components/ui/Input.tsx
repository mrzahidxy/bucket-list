import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>): React.JSX.Element => {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-text outline-none ring-primary/40 placeholder:text-slate-400 focus:ring-2",
        className
      )}
    />
  );
};
