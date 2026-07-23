import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPageShell({
  title,
  description,
  aside,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-10 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-16 lg:px-12 lg:py-24">
      <div className="max-w-xl lg:pt-10">
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
          {description}
        </p>
        {aside ? <div className="mt-8">{aside}</div> : null}
      </div>

      <section className="rounded-2xl border border-border bg-secondary/55 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
        {children}
        <div className="mt-6 border-t border-border pt-5 text-sm text-muted">
          {footer}
        </div>
      </section>
    </main>
  );
}
