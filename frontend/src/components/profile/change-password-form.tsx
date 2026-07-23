"use client";

import { useActionState, useEffect, useState } from "react";
import { changePasswordAction } from "@/app/actions/profile";
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

        <p className="text-xs leading-5 text-muted md:col-span-2 xl:col-span-3">
          Use 8 to 72 bytes with at least one letter and one number.
        </p>
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-5">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:translate-y-0 disabled:opacity-65 sm:w-auto sm:min-w-48"
        >
          {pending ? "Changing password..." : "Change password"}
        </button>
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
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
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
