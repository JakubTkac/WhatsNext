export function withAvatarRevision(
  avatarUrl: string | null,
  revision: string | number,
): string | null {
  if (!avatarUrl) {
    return null;
  }

  const url = new URL(avatarUrl, "https://whatsnext.local");
  url.searchParams.set("clientVersion", String(revision));

  return avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")
    ? url.toString()
    : `${url.pathname}${url.search}${url.hash}`;
}

export function ensureAvatarRevision(
  avatarUrl: string | null,
  revision: string | number,
): string | null {
  if (!avatarUrl) {
    return null;
  }

  const url = new URL(avatarUrl, "https://whatsnext.local");

  return url.searchParams.has("clientVersion")
    ? avatarUrl
    : withAvatarRevision(avatarUrl, revision);
}
