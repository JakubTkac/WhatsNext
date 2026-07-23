"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PrimaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";

export function PageErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const retry = onRetry ?? (() => router.refresh());

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center px-2 py-4 sm:px-4">
      <section className="w-full rounded-xl border border-border bg-secondary/55 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-6">
        <span
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-base font-bold text-danger"
          aria-hidden="true"
        >
          !
        </span>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-danger">
          Something went wrong
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-5 text-muted">
          {description}
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <PrimaryButton
            onClick={() => startTransition(retry)}
            disabled={pending}
          >
            {pending ? "Trying again..." : "Try again"}
          </PrimaryButton>
          <SecondaryButtonLink href="/">
            Back to homepage
          </SecondaryButtonLink>
        </div>
      </section>
    </main>
  );
}
