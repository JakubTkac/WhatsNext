"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "@/components/ui/action-button";

type FeedbackTone = "success" | "warning" | "error";

type FeedbackToastProps = {
  label: string;
  message: string;
  tone: FeedbackTone;
  durationMs: number;
  icon: ReactNode;
};

const toneStyles: Record<
  FeedbackTone,
  { border: string; icon: string; label: string }
> = {
  success: {
    border: "border-emerald-200",
    icon: "bg-success text-white",
    label: "text-success",
  },
  warning: {
    border: "border-amber-300",
    icon: "bg-amber-500 text-white",
    label: "text-amber-700",
  },
  error: {
    border: "border-red-200",
    icon: "bg-danger text-white",
    label: "text-danger",
  },
};

export function SuccessToast({ message }: { message: string }) {
  return (
    <FeedbackToast
      label="Success"
      message={message}
      tone="success"
      durationMs={4_500}
      icon={<CheckIcon />}
    />
  );
}

export function WarningToast({ message }: { message: string }) {
  return (
    <FeedbackToast
      label="Warning"
      message={message}
      tone="warning"
      durationMs={6_500}
      icon={<WarningIcon />}
    />
  );
}

export function ErrorToast({ message }: { message: string }) {
  return (
    <FeedbackToast
      label="Something went wrong"
      message={message}
      tone="error"
      durationMs={8_000}
      icon={<WarningIcon />}
    />
  );
}

function FeedbackToast({
  label,
  message,
  tone,
  durationMs,
  icon,
}: FeedbackToastProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const styles = toneStyles[tone];

  useEffect(() => {
    setMounted(true);
    const timeoutId = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [durationMs]);

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`notification-toast fixed inset-x-2 bottom-2 z-[100] mx-auto flex min-h-14 w-auto max-w-xl items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 shadow-[0_12px_36px_rgba(15,23,42,0.2)] sm:bottom-4 sm:px-4 ${styles.border}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
            className={`text-[0.65rem] font-bold uppercase tracking-[0.1em] ${styles.label}`}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs font-semibold leading-4 text-foreground sm:text-sm">
          {message}
        </p>
      </div>
      <IconButton
        onClick={() => setVisible(false)}
        className="h-8 w-8 text-lg text-subtle"
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true">&times;</span>
      </IconButton>
    </div>,
    document.body,
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 7v6" />
      <path d="M12 17h.01" />
    </svg>
  );
}
