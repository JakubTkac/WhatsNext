import { NextResponse } from "next/server";
import {
  deleteAuthSession,
  getAccessToken,
} from "@/lib/auth";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type RouteContext = {
  params: Promise<{ movieSlug: string }>;
};

export async function PUT(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return updateWatchlist("PUT", context);
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return updateWatchlist("DELETE", context);
}

async function updateWatchlist(
  method: "PUT" | "DELETE",
  context: RouteContext,
): Promise<Response> {
  const { movieSlug: rawMovieSlug } = await context.params;
  const movieSlug = rawMovieSlug.trim().toLowerCase();

  if (!slugPattern.test(movieSlug) || movieSlug.length > 255) {
    return NextResponse.json(
      { message: "The selected movie is invalid." },
      { status: 400 },
    );
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Authentication is required." },
      { status: 401 },
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${apiUrl}/watchlist/${encodeURIComponent(movieSlug)}`,
      {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );
  } catch {
    return NextResponse.json(
      { message: "The watchlist service is unavailable. Please try again." },
      { status: 503 },
    );
  }

  if (response.status === 401 || response.status === 403) {
    await deleteAuthSession();
    return NextResponse.json(
      { message: "Your session has expired." },
      { status: 401 },
    );
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: readApiError(
          payload,
          "We could not update your watchlist.",
        ),
      },
      { status: response.status },
    );
  }

  return new Response(null, { status: 204 });
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
