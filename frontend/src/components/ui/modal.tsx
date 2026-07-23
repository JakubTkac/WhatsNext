"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/action-button";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="m-auto w-[calc(100%-1rem)] max-w-sm overflow-hidden rounded-xl border border-border bg-white p-0 text-foreground shadow-[0_16px_48px_rgba(15,23,42,0.24)] backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <h2
          id={titleId}
          className="text-lg font-semibold tracking-[-0.025em]"
        >
          {title}
        </h2>
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          className="h-8 w-8 text-lg"
        >
          <span aria-hidden="true">&times;</span>
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
