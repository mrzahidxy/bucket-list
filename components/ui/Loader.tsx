import { CircleDashed, Dot, Loader2 } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LoaderSize = "sm" | "md" | "lg";
type LoaderVariant = "spinner" | "dots" | "circle";

type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: LoaderSize;
  variant?: LoaderVariant;
  text?: string;
  textClassName?: string;
  iconClassName?: string;
};

const containerSizeStyles: Record<LoaderSize, string> = {
  sm: "gap-2 text-xs",
  md: "gap-2.5 text-sm",
  lg: "gap-3 text-base"
};

const iconSizeStyles: Record<LoaderSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6"
};

const dotSizeStyles: Record<LoaderSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5"
};

export const Loader = ({
  className,
  size = "md",
  variant = "spinner",
  text,
  textClassName,
  iconClassName,
  role,
  "aria-live": ariaLive,
  ...props
}: LoaderProps): React.JSX.Element => {
  const iconClasses = cn("text-primary", iconSizeStyles[size], iconClassName);

  const icon =
    variant === "spinner" ? (
      <Loader2 className={cn(iconClasses, "animate-spin motion-reduce:animate-none")} aria-hidden="true" />
    ) : variant === "circle" ? (
      <CircleDashed className={cn(iconClasses, "animate-spin motion-reduce:animate-none [animation-duration:1.8s]")} aria-hidden="true" />
    ) : (
      <span className="inline-flex items-center" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <Dot
            key={index}
            className={cn(
              "-mx-0.5 text-primary motion-reduce:animate-none",
              dotSizeStyles[size],
              "animate-pulse"
            )}
            style={{ animationDelay: `${index * 180}ms`, animationDuration: "1s" }}
          />
        ))}
      </span>
    );

  return (
    <div
      className={cn("inline-flex items-center justify-center text-muted", containerSizeStyles[size], className)}
      role={role ?? (text ? "status" : undefined)}
      aria-live={ariaLive ?? (text ? "polite" : undefined)}
      {...props}
    >
      {icon}
      {text ? <span className={cn("font-medium text-muted", textClassName)}>{text}</span> : null}
    </div>
  );
};
