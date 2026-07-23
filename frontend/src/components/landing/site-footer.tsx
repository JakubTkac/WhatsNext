import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-secondary/60">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-5 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-12">
        <div>
          <Link
            href="/"
            aria-label="WhatsNext home"
            className="inline-block text-xl font-bold tracking-[-0.05em] text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Whats<span className="text-primary">Next</span>
          </Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Keep upcoming movies and community reviews in one place.
          </p>
        </div>

        <p className="text-sm text-subtle">
          &copy; {new Date().getFullYear()} WhatsNext
        </p>
      </div>
    </footer>
  );
}
