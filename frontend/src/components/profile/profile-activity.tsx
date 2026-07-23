import Image from "next/image";
import type {
  ProfileReview,
  ProfileWatchlistItem,
} from "@/lib/profile";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function WatchlistPreview({
  items,
  total,
}: {
  items: ProfileWatchlistItem[];
  total: number;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
      <SectionHeading title="Watchlist" count={total} />
      {items.length === 0 ? (
        <EmptyActivity message="Your watchlist is empty. Movies you save later will appear here." />
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 rounded-xl bg-secondary/70 p-3"
            >
              <MoviePoster
                posterUrl={item.movie.posterUrl}
                title={item.movie.title}
              />
              <div className="min-w-0 self-center">
                <p className="line-clamp-2 text-sm font-semibold text-foreground">
                  {item.movie.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Releases {formatMovieDate(item.movie.releaseDate)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReviewsPreview({
  reviews,
  total,
}: {
  reviews: ProfileReview[];
  total: number;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
      <SectionHeading title="Your reviews" count={total} />
      {reviews.length === 0 ? (
        <EmptyActivity message="You have not reviewed a movie yet. Your latest reviews will appear here." />
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-xl bg-secondary/70 p-4"
            >
              <span className="flex h-11 min-w-11 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-white">
                {review.rating}/10
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {review.movie.title}
                  </h3>
                  <time
                    dateTime={review.createdAt}
                    className="text-xs text-subtle"
                  >
                    {dateFormatter.format(new Date(review.createdAt))}
                  </time>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {review.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary">
        {count}
      </span>
    </div>
  );
}

function EmptyActivity({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-secondary/45 px-5 py-8 text-center text-sm leading-6 text-muted">
      {message}
    </div>
  );
}

function MoviePoster({
  posterUrl,
  title,
}: {
  posterUrl: string | null;
  title: string;
}) {
  return (
    <div className="relative aspect-[2/3] w-14 overflow-hidden rounded-lg bg-primary shadow-sm">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={`${title} poster`}
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : null}
    </div>
  );
}

function formatMovieDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}
