"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth-form";
import {
  AuthField,
  AuthFormError,
  AuthSubmitButton,
} from "./auth-form-parts";

const initialState: AuthFormState = {};

export function RegisterForm({ returnTo }: { returnTo: string }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />
      <AuthFormError message={state.formError} pending={pending} />
      <AuthField
        name="displayName"
        label="Display name"
        type="text"
        autoComplete="name"
        placeholder="How others will see you"
        minLength={2}
        maxLength={100}
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        error={state.fieldErrors?.displayName}
      />
      <AuthField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        maxLength={254}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={state.fieldErrors?.email}
      />
      <AuthField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        minLength={8}
        maxLength={72}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={state.fieldErrors?.password}
      />
      <p className="text-[0.7rem] leading-4 text-muted">
        Use 8 to 72 bytes with at least one letter and one number.
      </p>
      <AuthSubmitButton pending={pending} pendingLabel="Creating account...">
        Create account
      </AuthSubmitButton>
    </form>
  );
}
