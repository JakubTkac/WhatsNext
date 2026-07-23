import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ReviewsPreview,
  WatchlistPreview,
} from "@/components/profile/profile-activity";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { PageErrorState } from "@/components/ui/page-error-state";
import { getProfile } from "@/lib/profile";
import { createAuthHref } from "@/lib/return-to";
import { createPrivatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Your Profile",
  description:
    "Manage your WhatsNext profile, upcoming watchlist, and recent movie reviews.",
  path: "/profile",
});

export default async function ProfilePage() {
  const connection = await getProfile();

  if (connection.status === "unauthenticated") {
    redirect(createAuthHref("/login", "/profile"));
  }

  if (connection.status === "unavailable") {
    return (
      <PageErrorState
        title="Profile unavailable"
        description="We could not load your account details. The service may be temporarily unavailable."
      />
    );
  }

  const { profile } = connection;

  return (
    <main className="page-shell">
      <ProfileOverview
        displayName={profile.displayName}
        email={profile.email}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
      />

      <div className="mt-5 space-y-7">
        <WatchlistPreview
          items={profile.watchlistPreview}
          total={profile.stats.watchlistCount}
        />
        <ReviewsPreview
          author={{
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
          }}
          reviews={profile.recentReviews}
          total={profile.stats.reviewCount}
        />
        <RecentlyViewedMovies />
      </div>
    </main>
  );
}
