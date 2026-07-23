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

        <div className="flex flex-col gap-3 sm:items-end">
          <nav
            aria-label="Developer resources"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium"
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
              className="inline-flex min-h-8 cursor-pointer items-center rounded-lg border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground transition-[background-color,border-color,color] duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Download JSON
            </a>
          </nav>

          <p className="text-sm text-subtle">
            &copy; {new Date().getFullYear()} WhatsNext
          </p>
        </div>
      </div>
    </footer>
  );
}
