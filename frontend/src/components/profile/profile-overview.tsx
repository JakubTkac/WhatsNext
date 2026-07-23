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
};

export function ProfileOverview({
  displayName,
  email,
  bio,
  avatarUrl,
}: ProfileOverviewProps) {
  const [activeEditor, setActiveEditor] = useState<ProfileEditor | null>(null);

  function toggleEditor(editor: ProfileEditor) {
    setActiveEditor((current) => (current === editor ? null : editor));
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-border bg-secondary/55 p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)] sm:p-4">
        <div className="grid items-start gap-3 min-[36rem]:grid-cols-[auto_minmax(0,1fr)]">
          <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} />

          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-0.5 text-xs text-muted">{email}</p>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-muted sm:text-sm">
              {bio ?? "Add bio in the 'Edit Profile' menu."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/80 pt-3">
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
        </div>
      </section>

      {activeEditor ? (
        <section
          id="profile-editor-panel"
          className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-xl border border-border bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border bg-secondary/45 px-3 py-3 sm:px-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em]">
                {activeEditor === "details"
                  ? "Edit profile"
                  : "Change password"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {activeEditor === "details"
                  ? "Update the information shown on your profile."
                  : "Confirm your current password before choosing a new one."}
              </p>
            </div>
            <IconButton
              onClick={() => setActiveEditor(null)}
              aria-label="Close settings"
              className="h-8 w-8 bg-white text-lg"
            >
              <span aria-hidden="true">&times;</span>
            </IconButton>
          </div>

          <div className="p-3 sm:p-4">
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
