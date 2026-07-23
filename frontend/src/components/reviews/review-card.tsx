import Image from "next/image";
import type { LatestReview } from "@/lib/api";

const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export function ReviewCard({ review }: { review: LatestReview }) {
  const initial = review.author.displayName.trim().charAt(0).toUpperCase();

  return (
    <article className="flex min-h-80 flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
          {review.rating}/10
        </span>
        <time
          dateTime={review.createdAt}
          className="text-xs font-medium text-subtle"
        >
          {reviewDateFormatter.format(new Date(review.createdAt))}
        </time>
      </div>

      <blockquote className="mt-5 line-clamp-5 text-base leading-7 text-foreground">
        &ldquo;{review.body}&rdquo;
      </blockquote>

      <footer className="mt-auto grid grid-cols-[auto_minmax(0,1fr)_3rem] items-center gap-3 border-t border-border/70 pt-5">
        <div>
          {review.author.avatarUrl ? (
            <Image
              src={review.author.avatarUrl}
              alt=""
              width={36}
              height={36}
              unoptimized={review.author.avatarUrl.startsWith("data:")}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-primary"
              aria-hidden="true"
            >
              {initial}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {review.author.displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            reviewed {review.movie.title}
          </p>
        </div>

        <div className="relative aspect-[2/3] w-12 overflow-hidden rounded-lg bg-primary shadow-sm ring-1 ring-black/5">
          {review.movie.posterUrl ? (
            <Image
              src={review.movie.posterUrl}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : null}
        </div>
      </footer>
    </article>
  );
}
