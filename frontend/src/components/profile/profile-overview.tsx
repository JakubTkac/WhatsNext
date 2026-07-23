"use client";

import { useState } from "react";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/action-button";

type ProfileEditor = "details" | "password";

type ProfileOverviewProps = {
  displayName: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  stats: {
    watchlistCount: number;
    reviewCount: number;
  };
};

const memberSinceFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function ProfileOverview({
  displayName,
  email,
  bio,
  avatarUrl,
  createdAt,
  stats,
}: ProfileOverviewProps) {
  const [activeEditor, setActiveEditor] = useState<ProfileEditor | null>(null);

  function toggleEditor(editor: ProfileEditor) {
    setActiveEditor((current) => (current === editor ? null : editor));
  }

  return (
    <>
      <section className="overflow-hidden rounded-[2rem] border border-border bg-secondary/55 px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:px-10 sm:py-10">
        <div className="grid items-start gap-8 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} />

          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Your profile
            </p>
            <h1 className="mt-2 truncate text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-2 text-sm text-muted">{email}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              {bio ?? "Add bio in the 'Edit Profile' menu."}
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-subtle">
              Member since {memberSinceFormatter.format(new Date(createdAt))}
            </p>

            <div className="mt-7 flex flex-wrap gap-3 border-t border-border/80 pt-6">
              {activeEditor === "details" ? (
                <PrimaryButton
                  onClick={() => toggleEditor("details")}
                  aria-expanded="true"
                  aria-controls="profile-editor-panel"
                >
                  Edit profile
                </PrimaryButton>
              ) : (
                <SecondaryButton
                  onClick={() => toggleEditor("details")}
                  aria-expanded="false"
                  aria-controls="profile-editor-panel"
                >
                  Edit profile
                </SecondaryButton>
              )}
              {activeEditor === "password" ? (
                <PrimaryButton
                  onClick={() => toggleEditor("password")}
                  aria-expanded="true"
                  aria-controls="profile-editor-panel"
                >
                  Change password
                </PrimaryButton>
              ) : (
                <SecondaryButton
                  onClick={() => toggleEditor("password")}
                  aria-expanded="false"
                  aria-controls="profile-editor-panel"
                >
                  Change password
                </SecondaryButton>
              )}
            </div>
          </div>

          <dl className="w-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:w-64">
            <ProfileStat label="Watchlist" value={stats.watchlistCount} />
            <ProfileStat label="Reviews" value={stats.reviewCount} />
          </dl>
        </div>
      </section>

      {activeEditor ? (
        <section
          id="profile-editor-panel"
          className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
        >
          <div className="flex items-start justify-between gap-6 border-b border-border bg-secondary/45 px-5 py-5 sm:px-7 sm:py-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                {activeEditor === "details"
                  ? "Edit profile"
                  : "Change password"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {activeEditor === "details"
                  ? "Update the information shown on your profile."
                  : "Confirm your current password before choosing a new one."}
              </p>
            </div>
            <IconButton
              onClick={() => setActiveEditor(null)}
              aria-label="Close settings"
              className="h-10 w-10 bg-white text-xl"
            >
              <span aria-hidden="true">&times;</span>
            </IconButton>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            {activeEditor === "details" ? (
              <ProfileEditForm
                displayName={displayName}
                email={email}
                bio={bio}
              />
            ) : (
              <ChangePasswordForm />
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border px-5 py-4 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
        {label}
      </dt>
      <dd className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
        {value}
      </dd>
    </div>
  );
}
