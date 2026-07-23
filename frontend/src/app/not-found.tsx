import { PrimaryButtonLink } from "@/components/ui/action-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-1 items-center px-2 py-4 sm:px-4">
      <section className="w-full rounded-xl border border-border bg-secondary/55 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-6">
        <span
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-primary"
          aria-hidden="true"
        >
          404
        </span>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
          Page not found
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          This page does not exist
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-5 text-muted">
          The address may be incorrect, or the page may have been moved.
        </p>
        <div className="mt-4 flex justify-center">
          <PrimaryButtonLink href="/">Back to homepage</PrimaryButtonLink>
        </div>
      </section>
    </main>
  );
}
