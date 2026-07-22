import "server-only";

type BackendHealth = {
  status: "ok";
  database: "up";
};

export type BackendConnection =
  | { online: true; health: BackendHealth }
  | { online: false };

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export async function getBackendHealth(): Promise<BackendConnection> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const health = (await response.json()) as BackendHealth;

    if (health.status !== "ok" || health.database !== "up") {
      return { online: false };
    }

    return { online: true, health };
  } catch {
    return { online: false };
  }
}
