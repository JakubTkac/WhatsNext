import { PrimaryButtonLink } from "@/components/ui/action-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-1 items-center px-4 py-16 sm:px-8">
      <section className="w-full rounded-[2rem] border border-border bg-secondary/55 px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:px-12 sm:py-16">
        <span
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-primary"
          aria-hidden="true"
        >
          404
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Page not found
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          This page does not exist
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
          The address may be incorrect, or the page may have been moved.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryButtonLink href="/">Back to homepage</PrimaryButtonLink>
        </div>
      </section>
    </main>
  );
}
