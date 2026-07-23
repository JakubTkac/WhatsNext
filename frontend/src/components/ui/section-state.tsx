"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui/action-button";

type SectionStateProps = {
  title: string;
  description: string;
};

export function SectionErrorState({
  title,
  description,
}: SectionStateProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50/70 px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">
      <div className="flex min-w-0 gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-danger"
          aria-hidden="true"
        >
          !
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-xs leading-4 text-muted">
            {description}
          </p>
        </div>
      </div>
      <PrimaryButton
        onClick={() => startTransition(() => router.refresh())}
        disabled={pending}
        className="shrink-0 self-start sm:self-auto"
      >
        {pending ? "Trying again..." : "Try again"}
      </PrimaryButton>
    </div>
  );
}

export function SectionEmptyState({
  title,
  description,
}: SectionStateProps) {
  return (
    <div className="rounded-xl border border-border bg-secondary/55 px-2.5 py-2.5 sm:flex sm:items-baseline sm:gap-2 sm:px-3">
      <h2 className="text-sm font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-0.5 text-xs leading-4 text-muted sm:mt-0">
        {description}
      </p>
    </div>
  );
}
