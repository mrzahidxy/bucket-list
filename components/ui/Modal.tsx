"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent, type PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
}>;

export const Modal = ({ open, onClose, title, subtitle, children }: ModalProps): React.JSX.Element | null => {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [open]);

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descriptionId : undefined}
        onKeyDown={onDialogKeyDown}
        className="w-full max-w-2xl rounded-3xl border border-line bg-panel shadow-soft"
      >
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <h2 id={titleId} className="text-2xl font-bold text-text">{title}</h2>
            {subtitle ? <p id={descriptionId} className="text-sm text-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
