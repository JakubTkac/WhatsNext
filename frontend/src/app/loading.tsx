import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center px-2 py-4">
      <LoadingSpinner />
    </main>
  );
}
