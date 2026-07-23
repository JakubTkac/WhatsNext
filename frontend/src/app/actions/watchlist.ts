"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteAuthSession, getAccessToken } from "@/lib/auth";
import { createAuthHref, normalizeReturnTo } from "@/lib/return-to";
import type { WatchlistFormState } from "@/lib/watchlist-form";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function toggleWatchlistAction(
  previousState: WatchlistFormState,
  formData: FormData,
): Promise<WatchlistFormState> {
  const movieSlug = readString(formData, "movieSlug").trim().toLowerCase();
  const returnTo = normalizeReturnTo(readString(formData, "returnTo"));
  const intent = readString(formData, "intent");
  const shouldSave = intent === "add";

  if (
    !slugPattern.test(movieSlug) ||
    movieSlug.length > 255 ||
    (intent !== "add" && intent !== "remove")
  ) {
    return {
      ...previousState,
      formError: "The selected movie is invalid.",
      successMessage: undefined,
    };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    redirect(createAuthHref("/login", returnTo));
  }

  let response: Response;

  try {
    response = await fetch(
      `${apiUrl}/watchlist/${encodeURIComponent(movieSlug)}`,
      {
        method: shouldSave ? "PUT" : "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );
  } catch {
    return {
      ...previousState,
      formError: "The watchlist service is unavailable. Please try again.",
      successMessage: undefined,
    };
  }

  if (response.status === 401 || response.status === 403) {
    await deleteAuthSession();
    redirect(createAuthHref("/login", returnTo));
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    return {
      ...previousState,
      formError: readApiError(payload, "We could not update your watchlist."),
      successMessage: undefined,
    };
  }

  revalidatePath("/movies");
  revalidatePath("/profile");

  return {
    successRevision: previousState.successRevision + 1,
    saved: shouldSave,
    successMessage: shouldSave
      ? "Movie added to your watchlist."
      : "Movie removed from your watchlist.",
  };
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
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
