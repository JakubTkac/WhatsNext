import { redirect } from "next/navigation";
import {
  ReviewsPreview,
  WatchlistPreview,
} from "@/components/profile/profile-activity";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { PageErrorState } from "@/components/ui/page-error-state";
import { getProfile } from "@/lib/profile";

export default async function ProfilePage() {
  const connection = await getProfile();

  if (connection.status === "unauthenticated") {
    redirect("/login");
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
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <ProfileOverview
        displayName={profile.displayName}
        email={profile.email}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        createdAt={profile.createdAt}
        stats={profile.stats}
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <WatchlistPreview
          items={profile.watchlistPreview}
          total={profile.stats.watchlistCount}
        />
        <ReviewsPreview
          reviews={profile.recentReviews}
          total={profile.stats.reviewCount}
        />
      </div>
    </main>
  );
}
