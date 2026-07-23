import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { unstable_cache } from "next/cache";
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
const AUTH_USER_COOKIE_NAME = "whatsnext_auth_user";
const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  const storedUser = readSignedUser(
    cookieStore.get(AUTH_USER_COOKIE_NAME)?.value,
    accessToken,
  );

  if (storedUser) {
    return storedUser;
  }

  return getCachedCurrentUser(accessToken);
});

const getCachedCurrentUser = unstable_cache(
  async (accessToken: string): Promise<AuthUser | null> => {
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
  },
  ["current-auth-user"],
  { revalidate: 604_800 },
);

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function createAuthSession(
  accessToken: string,
  expiresIn: number,
  user: AuthUser,
): Promise<void> {
  const cookieStore = await cookies();
  const options = getCookieOptions(expiresIn);

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, options);
  cookieStore.set(
    AUTH_USER_COOKIE_NAME,
    createSignedUser(user, accessToken),
    options,
  );
}

export async function updateAuthSessionUser(user: AuthUser): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return;
  }

  cookieStore.set(
    AUTH_USER_COOKIE_NAME,
    createSignedUser(user, accessToken),
    getCookieOptions(readRemainingTokenLifetime(accessToken)),
  );
}

export async function deleteAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(AUTH_USER_COOKIE_NAME);
}

export function isAuthUser(value: unknown): value is AuthUser {
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

function createSignedUser(user: AuthUser, accessToken: string): string {
  const snapshot: AuthUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
  const payload = Buffer.from(JSON.stringify(snapshot)).toString("base64url");
  const signature = signUserPayload(payload, accessToken);
  return `${payload}.${signature}`;
}

function readSignedUser(
  value: string | undefined,
  accessToken: string,
): AuthUser | null {
  if (!value) {
    return null;
  }

  const separatorIndex = value.lastIndexOf(".");

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return null;
  }

  const payload = value.slice(0, separatorIndex);
  const providedSignature = Buffer.from(
    value.slice(separatorIndex + 1),
    "base64url",
  );
  const expectedSignature = Buffer.from(
    signUserPayload(payload, accessToken),
    "base64url",
  );

  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const user: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return isAuthUser(user) ? user : null;
  } catch {
    return null;
  }
}

function signUserPayload(payload: string, accessToken: string): string {
  return createHmac("sha256", accessToken)
    .update(payload)
    .digest("base64url");
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
    priority: "high",
  } as const;
}

function readRemainingTokenLifetime(accessToken: string): number {
  const fallbackLifetime = 86_400;

  try {
    const [, encodedPayload] = accessToken.split(".");
    const payload: unknown = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );

    if (!isRecord(payload) || typeof payload.exp !== "number") {
      return fallbackLifetime;
    }

    return Math.max(1, Math.floor(payload.exp - Date.now() / 1000));
  } catch {
    return fallbackLifetime;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
