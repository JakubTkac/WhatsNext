"use client";

import { useActionState, useEffect, useState } from "react";
import { changePasswordAction } from "@/app/actions/profile";
import { PrimaryButton } from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import type { ChangePasswordFormState } from "@/lib/profile-form";

const initialState: ChangePasswordFormState = { successRevision: 0 };

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.successRevision === 0) {
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [state.successRevision]);

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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <PasswordInput
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          error={state.fieldErrors?.currentPassword}
        />
        <PasswordInput
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
          error={state.fieldErrors?.newPassword}
        />
        <PasswordInput
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={state.fieldErrors?.confirmPassword}
        />

        <p className="text-[0.7rem] leading-4 text-muted md:col-span-2 xl:col-span-3">
          Use 8 to 72 bytes with at least one letter and one number.
        </p>
      </div>

      <div className="mt-3 flex justify-end border-t border-border pt-3">
        <PrimaryButton
          type="submit"
          disabled={pending}
          className="w-full disabled:cursor-wait sm:w-auto sm:min-w-40"
        >
          {pending ? "Changing password..." : "Change password"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function PasswordInput({
  name,
  label,
  autoComplete,
  value,
  onChange,
  error,
}: {
  name: "currentPassword" | "newPassword" | "confirmPassword";
  label: string;
  autoComplete: "current-password" | "new-password";
  value: string;
  onChange: (value: string) => void;
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
        type="password"
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={72}
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
