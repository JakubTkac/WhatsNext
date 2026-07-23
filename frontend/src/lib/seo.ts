import type { Metadata } from "next";

export const SITE_NAME = "WhatsNext";
export const SITE_DESCRIPTION =
  "Discover upcoming movies, save your watchlist, and explore community reviews.";
export const SITE_LOCALE = "en_US";

const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_SOCIAL_IMAGE = {
  url: "/social-card",
  width: 1200,
  height: 630,
  alt: "WhatsNext — upcoming movies, watchlists, and community reviews",
};

export const siteUrl = resolveSiteUrl();

type SocialImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  images?: SocialImage[];
};

export function createPublicPageMetadata(
  input: PageMetadataInput,
): Metadata {
  return createPageMetadata(input, {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  });
}

export function createAuthPageMetadata(input: PageMetadataInput): Metadata {
  return createPageMetadata(input, {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  });
}

export function createPrivatePageMetadata(
  input: PageMetadataInput,
): Metadata {
  return createPageMetadata(input, {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  });
}

export function createMissingPageMetadata(
  input: PageMetadataInput,
): Metadata {
  return createPrivatePageMetadata(input);
}

export function createWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/movies")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function shortenSeoDescription(
  value: string,
  fallback = SITE_DESCRIPTION,
  maxLength = 160,
): string {
  const normalized = value.replace(/\s+/g, " ").trim() || fallback;

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const candidate = normalized.slice(0, maxLength - 1).trimEnd();
  const lastSpace = candidate.lastIndexOf(" ");
  const shortened =
    lastSpace >= Math.floor(maxLength * 0.65)
      ? candidate.slice(0, lastSpace)
      : candidate;

  return `${shortened.trimEnd()}…`;
}

function createPageMetadata(
  { title, description, path, images }: PageMetadataInput,
  robots: Metadata["robots"],
): Metadata {
  const normalizedDescription = shortenSeoDescription(description);
  const socialTitle = `${title} | ${SITE_NAME}`;
  const socialImages = images?.length ? images : [DEFAULT_SOCIAL_IMAGE];

  return {
    title,
    description: normalizedDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url: path,
      title: socialTitle,
      description: normalizedDescription,
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: normalizedDescription,
      images: socialImages.map(({ url, alt }) => ({ url, alt })),
    },
    robots,
  };
}

function resolveSiteUrl(): URL {
  const configuredUrl =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : DEFAULT_SITE_URL);

  try {
    const parsedUrl = new URL(configuredUrl);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return new URL(DEFAULT_SITE_URL);
    }

    return parsedUrl;
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}
