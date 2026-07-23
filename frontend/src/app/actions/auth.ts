"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuthFormState, AuthFieldErrors } from "@/lib/auth-form";
import {
  createAuthSession,
  deleteAuthSession,
  isAuthUser,
  type AuthUser,
} from "@/lib/auth";
import { normalizeReturnTo } from "@/lib/return-to";

type AuthApiResponse = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email").trim().toLowerCase();
  const password = readString(formData, "password");
  const returnTo = normalizeReturnTo(readString(formData, "returnTo"));
  const fieldErrors = validateLogin(email, password);

  if (hasErrors(fieldErrors)) {
    return { fieldErrors };
  }

  const result = await requestAuth("login", { email, password });

  if ("error" in result) {
    return { formError: result.error };
  }

  await createAuthSession(result.accessToken, result.expiresIn, result.user);
  revalidatePath("/", "layout");
  redirect(returnTo);
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const displayName = readString(formData, "displayName").trim();
  const email = readString(formData, "email").trim().toLowerCase();
  const password = readString(formData, "password");
  const returnTo = normalizeReturnTo(readString(formData, "returnTo"));
  const fieldErrors = validateRegistration(displayName, email, password);

  if (hasErrors(fieldErrors)) {
    return { fieldErrors };
  }

  const result = await requestAuth("register", {
    displayName,
    email,
    password,
  });

  if ("error" in result) {
    return { formError: result.error };
  }

  await createAuthSession(result.accessToken, result.expiresIn, result.user);
  revalidatePath("/", "layout");
  redirect(returnTo);
}

export async function logoutAction(formData: FormData): Promise<void> {
  const returnTo = normalizeReturnTo(readString(formData, "returnTo"));

  await deleteAuthSession();
  revalidatePath("/", "layout");
  redirect(returnTo);
}

async function requestAuth(
  endpoint: "login" | "register",
  body: Record<string, string>,
): Promise<AuthApiResponse | { error: string }> {
  try {
    const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    const payload: unknown = await response.json();

    if (!response.ok) {
      return {
        error: readApiError(
          payload,
          endpoint === "login"
            ? "Invalid email or password."
            : "We could not create your account.",
        ),
      };
    }

    if (!isAuthApiResponse(payload)) {
      return { error: "The authentication service returned an invalid response." };
    }

    return payload;
  } catch {
    return {
      error: "The authentication service is unavailable. Please try again.",
    };
  }
}

function validateLogin(email: string, password: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (byteLength(password) < 1 || byteLength(password) > 72) {
    errors.password = "Enter your password.";
  }

  return errors;
}

function validateRegistration(
  displayName: string,
  email: string,
  password: string,
): AuthFieldErrors {
  const errors = validateLogin(email, password);
  const passwordLength = byteLength(password);

  if (displayName.length < 2 || displayName.length > 100) {
    errors.displayName = "Display name must contain 2 to 100 characters.";
  }

  if (
    passwordLength < 8 ||
    passwordLength > 72 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    errors.password =
      "Password must be 8 to 72 bytes and contain a letter and a number.";
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  return email.length <= 254 && emailPattern.test(email);
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function hasErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

function isAuthApiResponse(value: unknown): value is AuthApiResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accessToken === "string" &&
    value.accessToken.length > 0 &&
    typeof value.expiresIn === "number" &&
    Number.isInteger(value.expiresIn) &&
    value.expiresIn > 0 &&
    isAuthUser(value.user)
  );
}

function readApiError(value: unknown, fallback: string): string {
  if (!isRecord(value)) {
    return fallback;
  }

  if (typeof value.message === "string") {
    return value.message.slice(0, 240);
  }

  if (Array.isArray(value.message)) {
    return value.message
      .filter((message): message is string => typeof message === "string")
      .join(" ")
      .slice(0, 240);
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
