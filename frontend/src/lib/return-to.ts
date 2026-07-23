const defaultReturnTo = "/";
const internalOrigin = "https://whatsnext.local";

export function normalizeReturnTo(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\r\n]/.test(value)
  ) {
    return defaultReturnTo;
  }

  try {
    const url = new URL(value, internalOrigin);

    if (url.origin !== internalOrigin) {
      return defaultReturnTo;
    }

    if (url.pathname === "/login" || url.pathname === "/register") {
      return defaultReturnTo;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return defaultReturnTo;
  }
}

export function createAuthHref(
  pathname: "/login" | "/register",
  returnTo: string,
): string {
  const normalizedReturnTo = normalizeReturnTo(returnTo);

  if (normalizedReturnTo === defaultReturnTo) {
    return pathname;
  }

  return `${pathname}?returnTo=${encodeURIComponent(normalizedReturnTo)}`;
}
