"use client";

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

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-red-200 bg-red-50/70 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex min-w-0 gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-danger"
          aria-hidden="true"
        >
          !
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      <PrimaryButton
        onClick={() => router.refresh()}
        className="shrink-0 self-start sm:self-auto"
      >
        Try again
      </PrimaryButton>
    </div>
  );
}

export function SectionEmptyState({
  title,
  description,
}: SectionStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/55 px-6 py-9 sm:px-8">
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
