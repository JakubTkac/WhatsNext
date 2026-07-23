import Link from "next/link";

const DEFAULT_PUBLIC_API_URL = "http://localhost:8080/api";

function getApiDocumentationUrls() {
  const publicApiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_PUBLIC_API_URL;
  const backendUrl = publicApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

  return {
    openApiUrl: `${backendUrl}/docs/openapi.json`,
    swaggerUrl: `${backendUrl}/docs`,
  };
}

export function SiteFooter() {
  const { openApiUrl, swaggerUrl } = getApiDocumentationUrls();

  return (
    <footer className="mt-auto border-t border-border/80 bg-secondary/60">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-6">
        <div className="min-w-0">
          <Link
            href="/"
            aria-label="WhatsNext home"
            className="inline-block text-base font-bold tracking-[-0.05em] text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Whats<span className="text-primary">Next</span>
          </Link>
          <p className="mt-0.5 max-w-md truncate text-xs leading-4 text-muted">
            Keep upcoming movies and community reviews in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
          <nav
            aria-label="Developer resources"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium"
          >
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Swagger UI
            </a>
            <a
              href={openApiUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              OpenAPI JSON
            </a>
            <a
              href="/openapi.json"
              download="whatsnext-openapi.json"
              className="inline-flex min-h-7 cursor-pointer items-center rounded-md border border-border bg-white px-2 py-0.5 text-[0.7rem] font-semibold text-foreground transition-[background-color,border-color,color] duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Download JSON
            </a>
          </nav>

          <p className="text-xs text-subtle">
            &copy; {new Date().getFullYear()} WhatsNext
          </p>
        </div>
      </div>
    </footer>
  );
}
