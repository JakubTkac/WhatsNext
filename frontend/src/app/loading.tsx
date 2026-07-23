export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center px-4 py-16">
      <div
        role="status"
        aria-label="Loading page"
        className="flex flex-col items-center gap-4"
      >
        <span
          className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-primary motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-muted">Loading...</p>
      </div>
    </main>
  );
}
