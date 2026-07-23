"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { PrimaryButton } from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import type { ProfileFormState } from "@/lib/profile-form";

type ProfileEditFormProps = {
  displayName: string;
  email: string;
  bio: string | null;
};

const initialState: ProfileFormState = { successRevision: 0 };

export function ProfileEditForm({
  displayName: initialDisplayName,
  email: initialEmail,
  bio: initialBio,
}: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [email, setEmail] = useState(initialEmail);
  const [bio, setBio] = useState(initialBio ?? "");
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const isDirty =
    displayName.trim() !== initialDisplayName ||
    email.trim().toLowerCase() !== initialEmail ||
    bio.trim() !== (initialBio ?? "");

  return (
    <form action={formAction} noValidate>
      {state.formError && !pending ? (
        <ErrorToast message={state.formError} />
      ) : null}
      {state.successMessage ? (
        <SuccessToast
          key={state.successRevision}
          message={state.successMessage}
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <ProfileInput
          name="displayName"
          label="Display name"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={setDisplayName}
          maxLength={100}
          error={state.fieldErrors?.displayName}
        />

        <ProfileInput
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          maxLength={254}
          error={state.fieldErrors?.email}
        />

        <div className="md:col-span-2">
          <label htmlFor="bio" className="dense-label mb-0">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
            rows={3}
            aria-invalid={state.fieldErrors?.bio ? true : undefined}
            aria-describedby={state.fieldErrors?.bio ? "bio-error" : "bio-help"}
            className="dense-field mt-1 resize-y leading-5"
            placeholder="Tell people what you like to watch"
          />
          {state.fieldErrors?.bio ? (
            <p id="bio-error" role="alert" className="mt-1 text-xs text-danger">
              {state.fieldErrors.bio}
            </p>
          ) : (
            <p id="bio-help" className="mt-1 text-[0.7rem] text-subtle">
              {bio.length}/500 characters
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end border-t border-border pt-3">
        <PrimaryButton
          type="submit"
          disabled={pending || !isDirty}
          className={`w-full sm:w-auto sm:min-w-36 ${
            pending ? "cursor-wait" : !isDirty ? "cursor-not-allowed" : ""
          }`}
        >
          {pending ? "Saving..." : isDirty ? "Save changes" : "No changes"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function ProfileInput({
  name,
  label,
  type,
  autoComplete,
  value,
  onChange,
  maxLength,
  error,
}: {
  name: "displayName" | "email";
  label: string;
  type: "email" | "text";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
}) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="dense-label mb-0">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="dense-field mt-1"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
