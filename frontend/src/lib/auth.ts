import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

const AUTH_COOKIE_NAME = "whatsnext_access_token";
const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return null;
    }

    const user: unknown = await response.json();
    return isAuthUser(user) ? user : null;
  } catch {
    return null;
  }
});

export async function createAuthSession(
  accessToken: string,
  expiresIn: number,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn,
    path: "/",
    priority: "high",
  });
}

export async function deleteAuthSession(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE_NAME);
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.displayName === "string" &&
    (typeof value.bio === "string" || value.bio === null) &&
    (typeof value.avatarUrl === "string" || value.avatarUrl === null)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
