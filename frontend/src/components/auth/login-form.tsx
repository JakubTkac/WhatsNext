"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/auth-form";
import {
  AuthField,
  AuthFormError,
  AuthSubmitButton,
} from "./auth-form-parts";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormError message={state.formError} pending={pending} />
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
        autoComplete="current-password"
        placeholder="Your password"
        maxLength={72}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={state.fieldErrors?.password}
      />
      <AuthSubmitButton pending={pending} pendingLabel="Logging in...">
        Log in
      </AuthSubmitButton>
    </form>
  );
}
