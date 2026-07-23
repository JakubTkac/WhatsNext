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
      className={`notification-toast fixed inset-x-4 bottom-5 z-[100] mx-auto flex min-h-24 w-auto max-w-2xl items-center gap-4 rounded-2xl border bg-white px-5 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:bottom-8 sm:px-6 ${styles.border}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-bold uppercase tracking-[0.14em] ${styles.label}`}
        >
          {label}
        </p>
        <p className="mt-1 text-base font-semibold leading-6 text-foreground sm:text-lg">
          {message}
        </p>
      </div>
      <IconButton
        onClick={() => setVisible(false)}
        className="h-10 w-10 text-xl text-subtle"
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
