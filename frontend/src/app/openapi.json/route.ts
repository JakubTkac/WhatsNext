const DEFAULT_API_URL = "http://127.0.0.1:8080/api";
const DOWNLOAD_FILENAME = "whatsnext-openapi.json";

export async function GET(): Promise<Response> {
  const apiUrl = process.env.API_URL ?? DEFAULT_API_URL;
  const backendUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

  try {
    const response = await fetch(`${backendUrl}/docs/openapi.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return unavailableResponse();
    }

    const document: unknown = await response.json();

    if (!isOpenApiDocument(document)) {
      return unavailableResponse();
    }

    return new Response(JSON.stringify(document, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${DOWNLOAD_FILENAME}"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return unavailableResponse();
  }
}

function unavailableResponse(): Response {
  return Response.json(
    { message: "The OpenAPI document is temporarily unavailable." },
    { status: 502 },
  );
}

function isOpenApiDocument(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "openapi" in value &&
    typeof value.openapi === "string" &&
    "paths" in value &&
    typeof value.paths === "object" &&
    value.paths !== null
  );
}
