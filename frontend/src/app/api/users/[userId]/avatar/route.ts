const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { userId } = await context.params;

  if (!uuidPattern.test(userId)) {
    return new Response(null, { status: 400 });
  }

  let response: Response;

  try {
    response = await fetch(
      `${apiUrl}/users/${encodeURIComponent(userId)}/avatar`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
  } catch {
    return new Response(null, { status: 503 });
  }

  const contentType = response.headers.get("content-type");

  if (
    !response.ok ||
    !response.body ||
    !contentType ||
    !allowedContentTypes.has(contentType)
  ) {
    return new Response(null, { status: response.status });
  }

  return new Response(response.body, {
    headers: {
      "Cache-Control":
        response.headers.get("cache-control") ??
        "public, max-age=60, stale-while-revalidate=300",
      "Content-Type": contentType,
    },
    status: 200,
  });
}
