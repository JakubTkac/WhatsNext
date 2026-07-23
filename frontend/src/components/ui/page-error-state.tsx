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
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center px-4 py-16 sm:px-8">
      <section className="w-full rounded-[2rem] border border-border bg-secondary/55 px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:px-12 sm:py-16">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-danger"
          aria-hidden="true"
        >
          !
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-danger">
          Something went wrong
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
          {description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
