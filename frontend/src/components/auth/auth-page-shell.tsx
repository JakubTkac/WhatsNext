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
    <main className="mx-auto grid w-full max-w-5xl flex-1 content-start items-start gap-4 px-2 py-3 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8 lg:px-6 lg:py-6">
      <div className="max-w-xl lg:pt-4">
        <h1 className="page-title">
          {title}
        </h1>
        <p className="page-lede">
          {description}
        </p>
        {aside ? <div className="mt-3">{aside}</div> : null}
      </div>

      <section className="rounded-xl border border-border bg-secondary/55 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-4">
        {children}
        <div className="mt-3 border-t border-border pt-3 text-xs text-muted">
          {footer}
        </div>
      </section>
    </main>
  );
}
