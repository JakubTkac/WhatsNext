import Image from "next/image";
import Link from "next/link";
import type { LatestReview } from "@/lib/api";

const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const reviewSkeletons = [0, 1, 2];

type ReviewCardAction = {
  href: string;
  label: string;
};

export function ReviewCard({
  review,
  primaryAction,
}: {
  review: LatestReview;
  primaryAction?: ReviewCardAction;
}) {
  const initial = review.author.displayName.trim().charAt(0).toUpperCase();

  return (
    <article
      className="relative flex min-h-80 flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
          {review.rating}/10
        </span>
        <div className="flex items-center gap-2">
          <time
            dateTime={review.createdAt}
            className="text-xs font-medium text-subtle"
          >
            {reviewDateFormatter.format(new Date(review.createdAt))}
          </time>
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              aria-label={primaryAction.label}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground outline-none transition-[background-color,border-color,color] duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Edit
            </Link>
          ) : null}
        </div>
      </div>

      <blockquote className="mt-5 line-clamp-5 text-base leading-7 text-foreground">
        &ldquo;{review.body}&rdquo;
      </blockquote>

      <footer className="mt-auto flex items-center gap-3 border-t border-border/70 pt-5">
        <div className="shrink-0">
          {review.author.avatarUrl ? (
            <Image
              src={review.author.avatarUrl}
              alt=""
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
              unoptimized
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

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {review.author.displayName}
          </p>
          <Link
            href={`/movies/${review.movie.slug}`}
            aria-label={`View ${review.movie.title}`}
            className="group/movie mt-1 block truncate rounded-sm text-xs text-muted outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            reviewed{" "}
            <span className="font-semibold text-blue-800 underline decoration-2 decoration-transparent underline-offset-2 transition-[color,text-decoration-color] duration-200 group-hover/movie:text-primary group-hover/movie:decoration-primary group-focus-visible/movie:text-primary group-focus-visible/movie:decoration-primary">
              {review.movie.title}
            </span>
          </Link>
        </div>

        <Link
          href={`/movies/${review.movie.slug}`}
          aria-label={`View ${review.movie.title}`}
          className="group/poster aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-lg bg-primary shadow-sm ring-2 ring-blue-100 outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:scale-[1.06] hover:shadow-[0_10px_24px_rgba(37,99,235,0.28)] hover:ring-primary/50 focus-visible:-translate-y-1 focus-visible:scale-[1.06] focus-visible:ring-primary/50 motion-reduce:transform-none"
        >
          {review.movie.posterUrl ? (
            <Image
              src={review.movie.posterUrl}
              alt={`${review.movie.title} poster`}
              fill
              sizes="48px"
              loading="lazy"
              decoding="async"
              className="object-cover transition-transform duration-200 group-hover/poster:scale-[1.05] group-focus-visible/poster:scale-[1.05] motion-reduce:transform-none"
            />
          ) : null}
        </Link>
      </footer>
    </article>
  );
}

export function ReviewCardsSkeleton() {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3" aria-hidden="true">
      {reviewSkeletons.map((item) => (
        <ReviewCardSkeleton key={item} />
      ))}
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="flex min-h-80 flex-col rounded-2xl border border-border/80 bg-white p-5 sm:p-6">
      <div className="flex justify-between gap-3">
        <div className="skeleton-surface h-7 w-16 rounded-full" />
        <div className="skeleton-surface h-4 w-12 rounded-full" />
      </div>
      <div className="skeleton-surface mt-6 h-5 w-full rounded-full" />
      <div className="skeleton-surface mt-3 h-5 w-11/12 rounded-full" />
      <div className="skeleton-surface mt-3 h-5 w-3/4 rounded-full" />
      <div className="mt-auto flex items-center gap-3 border-t border-border/70 pt-5">
        <div className="skeleton-surface h-9 w-9 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="skeleton-surface h-4 w-24 rounded-full" />
          <div className="skeleton-surface mt-2 h-3 w-32 max-w-full rounded-full" />
        </div>
        <div className="skeleton-surface aspect-[2/3] w-12 rounded-lg" />
      </div>
    </div>
  );
}
