export function LoadingSpinner({
  label = "Loading page",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center gap-4"
    >
      <span
        className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-primary motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-sm font-semibold text-muted">Loading...</p>
    </div>
  );
}
