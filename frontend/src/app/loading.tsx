import { SiteHeader } from "@/components/landing/site-header";
import { LatestReviewsSkeleton } from "@/components/landing/latest-reviews-skeleton";
import { UpcomingMoviesSkeleton } from "@/components/landing/upcoming-movies-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[92rem] px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="h-4 w-52 rounded-full bg-slate-300" />
        <div className="skeleton-surface mt-4 h-14 w-full max-w-xl rounded-xl sm:h-16" />
        <div className="mt-5 h-5 w-full max-w-2xl rounded-full bg-slate-200" />
        <div className="mt-3 h-5 w-3/4 max-w-xl rounded-full bg-slate-200" />
        <UpcomingMoviesSkeleton />
        <LatestReviewsSkeleton />
      </main>
    </div>
  );
}
