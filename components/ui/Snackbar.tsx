"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type SnackbarProps = {
  message: string | null;
  type?: "success" | "error";
  onClose: () => void;
};

export const Snackbar = ({ message, type = "success", onClose }: SnackbarProps): React.JSX.Element | null => {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => onClose(), 2800);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2">
      <div
        className={cn(
          "rounded-xl px-4 py-2 text-sm font-medium text-white shadow-soft",
          type === "success" ? "bg-emerald-600" : "bg-red-600"
        )}
      >
        {message}
      </div>
    </div>
  );
};
