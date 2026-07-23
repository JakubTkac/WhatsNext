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

      <div className="grid gap-5 md:grid-cols-2">
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
          <label htmlFor="bio" className="text-sm font-semibold text-foreground">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
            rows={4}
            aria-invalid={state.fieldErrors?.bio ? true : undefined}
            aria-describedby={state.fieldErrors?.bio ? "bio-error" : "bio-help"}
            className="mt-2 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
            placeholder="Tell people what you like to watch"
          />
          {state.fieldErrors?.bio ? (
            <p id="bio-error" role="alert" className="mt-2 text-sm text-danger">
              {state.fieldErrors.bio}
            </p>
          ) : (
            <p id="bio-help" className="mt-2 text-xs text-subtle">
              {bio.length}/500 characters
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-5">
        <PrimaryButton
          type="submit"
          disabled={pending || !isDirty}
          className={`w-full sm:w-auto sm:min-w-44 ${
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
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
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
        className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
