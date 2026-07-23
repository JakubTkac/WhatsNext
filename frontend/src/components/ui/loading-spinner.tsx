export function LoadingSpinner({
  label = "Loading page",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center gap-2"
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-100 border-t-primary motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-xs font-semibold text-muted">Loading...</p>
    </div>
  );
}
