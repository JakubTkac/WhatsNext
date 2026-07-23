import { Suspense } from "react";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewFilters } from "@/components/reviews/review-filters";
import { ReviewManager } from "@/components/reviews/review-manager";
import {
  OwnedReviewsSkeleton,
  ReviewResultsSkeleton,
} from "@/components/reviews/reviews-page-skeleton";
import { PageErrorState } from "@/components/ui/page-error-state";
import {
  ListingNavigationProvider,
  ListingPendingContent,
} from "@/components/ui/listing-navigation";
import { Pagination } from "@/components/ui/pagination";
import { SectionEmptyState } from "@/components/ui/section-state";
import {
  getReviewsPage,
  getReviewWorkspace,
  type ReviewsQuery,
} from "@/lib/api";

type ReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const params = await searchParams;
  const query = parseReviewsQuery(params);
  const myPage = readPositiveInteger(params.myPage);
  const editReviewId = readOptionalString(params.edit, 64);

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="max-w-3xl">
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
          Movie reviews
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Browse what the community has watched and rated recently.
        </p>
      </div>

      <ListingNavigationProvider>
        <ReviewFilters
          key={`${query.movie ?? ""}-${query.rating ?? ""}`}
          query={query}
        />

        <ListingPendingContent fallback={<ReviewResultsSkeleton />}>
          <Suspense fallback={<ReviewResultsSkeleton />}>
            <PublicReviewResults query={query} myPage={myPage} />
          </Suspense>
        </ListingPendingContent>
      </ListingNavigationProvider>

      <Suspense
        key={`${myPage}-${editReviewId ?? "reviews"}`}
        fallback={<OwnedReviewsSkeleton />}
      >
        <OwnedReviewWorkspace
          query={query}
          myPage={myPage}
          editReviewId={editReviewId}
        />
      </Suspense>
    </main>
  );
}

async function PublicReviewResults({
  query,
  myPage,
}: {
  query: ReviewsQuery;
  myPage: number;
}) {
  const connection = await getReviewsPage(query);

  if (!connection.online) {
    return (
      <PageErrorState
        title="Reviews unavailable"
        description="We could not load community reviews. Please try again."
      />
    );
  }

  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {connection.meta.totalItems}{" "}
          {connection.meta.totalItems === 1 ? "review" : "reviews"}
        </p>
        <p className="text-sm text-subtle">
          Page {connection.meta.page}
          {connection.meta.totalPages > 0
            ? ` of ${connection.meta.totalPages}`
            : ""}
        </p>
      </div>

      {connection.reviews.length === 0 ? (
        <div className="mt-6">
          <SectionEmptyState
            title="No reviews match these filters"
            description="Adjust the movie title or rating and try again."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connection.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={connection.meta.page}
        totalPages={connection.meta.totalPages}
        pathname="/reviews"
        query={{
          movie: query.movie,
          rating: query.rating,
          myPage: myPage > 1 ? myPage : undefined,
        }}
      />
    </>
  );
}

async function OwnedReviewWorkspace({
  query,
  myPage,
  editReviewId,
}: {
  query: ReviewsQuery;
  myPage: number;
  editReviewId?: string;
}) {
  const workspace = await getReviewWorkspace(myPage);

  return (
    <ReviewManager
      key={`${myPage}-${editReviewId ?? "reviews"}`}
      connection={workspace}
      initialEditReviewId={editReviewId}
      paginationQuery={{
        page: query.page > 1 ? query.page : undefined,
        movie: query.movie,
        rating: query.rating,
      }}
    />
  );
}

function parseReviewsQuery(
  params: Record<string, string | string[] | undefined>,
): ReviewsQuery {
  const rating = Number(readString(params.rating));

  return {
    page: readPositiveInteger(params.page),
    movie: readOptionalString(params.movie, 80),
    rating:
      Number.isInteger(rating) && rating >= 1 && rating <= 10
        ? rating
        : undefined,
  };
}

function readPositiveInteger(value: string | string[] | undefined): number {
  const parsed = Number(readString(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readOptionalString(
  value: string | string[] | undefined,
  maximumLength: number,
): string | undefined {
  const normalized = readString(value).trim().slice(0, maximumLength);
  return normalized || undefined;
}

function readString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
