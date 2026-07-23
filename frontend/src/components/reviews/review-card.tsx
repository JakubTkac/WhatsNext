import Image from "next/image";
import Link from "next/link";
import type { LatestReview } from "@/lib/api";

const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const reviewSkeletons = [0, 1, 2, 3];

type ReviewCardAction = {
  href: string;
  label: string;
};

type ReviewCardProps = {
  review: LatestReview;
  primaryAction?: ReviewCardAction;
};

export function ReviewCard({
  review,
  primaryAction,
}: ReviewCardProps) {
  const initial = review.author.displayName.trim().charAt(0).toUpperCase();

  return (
    <article className="relative flex min-h-48 min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-white p-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)] sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.65rem] font-semibold leading-3.5 text-white">
          {review.rating}/10
        </span>
        <div className="flex items-center gap-1">
          <time
            dateTime={review.createdAt}
            className="text-[0.65rem] font-medium text-subtle"
          >
            {reviewDateFormatter.format(new Date(review.createdAt))}
          </time>
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              aria-label={primaryAction.label}
              className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border border-border bg-white px-2 text-[0.65rem] font-semibold text-foreground outline-none transition-[background-color,border-color,color] duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Edit
            </Link>
          ) : null}
        </div>
      </div>

      <blockquote className="mt-2 line-clamp-3 text-sm leading-5 text-foreground">
        &ldquo;{review.body}&rdquo;
      </blockquote>

      <footer className="mt-auto flex items-center gap-2 border-t border-border/70 pt-2">
        <div className="shrink-0">
          {review.author.avatarUrl ? (
            <Image
              src={review.author.avatarUrl}
              alt=""
              width={28}
              height={28}
              loading="lazy"
              decoding="async"
              unoptimized
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary"
              aria-hidden="true"
            >
              {initial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {review.author.displayName}
          </p>
          <Link
            href={`/movies/${review.movie.slug}`}
            aria-label={`View ${review.movie.title}`}
            className="group/movie mt-0.5 block truncate rounded-sm text-[0.65rem] text-muted outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
          className="group/poster relative aspect-[2/3] w-9 shrink-0 overflow-hidden rounded-md bg-primary shadow-sm ring-2 ring-blue-100 outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_8px_18px_rgba(37,99,235,0.24)] hover:ring-primary/50 focus-visible:-translate-y-0.5 focus-visible:scale-[1.04] focus-visible:ring-primary/50 motion-reduce:transform-none"
        >
          {review.movie.posterUrl ? (
            <Image
              src={review.movie.posterUrl}
              alt={`${review.movie.title} poster`}
              fill
              sizes="2.25rem"
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
    <div
      className="mt-3 grid gap-2 min-[36rem]:grid-cols-2 xl:grid-cols-4"
      aria-hidden="true"
    >
      {reviewSkeletons.map((item) => (
        <ReviewCardSkeleton key={item} />
      ))}
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="flex min-h-48 min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-white p-2.5 sm:p-3">
      <div className="flex justify-between gap-2">
        <div className="skeleton-surface h-5 w-12 rounded-full" />
        <div className="skeleton-surface h-3 w-12 rounded-full" />
      </div>
      <div className="skeleton-surface mt-3 h-4 w-full rounded-full" />
      <div className="skeleton-surface mt-2 h-4 w-11/12 rounded-full" />
      <div className="skeleton-surface mt-2 h-4 w-3/4 rounded-full" />
      <div className="mt-auto flex items-center gap-2 border-t border-border/70 pt-2">
        <div className="skeleton-surface h-7 w-7 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="skeleton-surface h-3 w-20 rounded-full" />
          <div className="skeleton-surface mt-1.5 h-2.5 w-28 max-w-full rounded-full" />
        </div>
        <div className="skeleton-surface aspect-[2/3] w-9 rounded-md" />
      </div>
    </div>
  );
}
