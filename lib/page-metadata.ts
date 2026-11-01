import type { Metadata } from "next";

import { SITE_NAME, SITE_TAGLINE } from "@/config/site";

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
} as const;

export interface ShareImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/** OG/twitter image. An empty url keeps the default /opengraph-image card. */
export function shareImage(
  url: string | null | undefined,
  alt: string,
): ShareImage {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return DEFAULT_OG_IMAGE;
  return {
    url: trimmed,
    width: DEFAULT_OG_IMAGE.width,
    height: DEFAULT_OG_IMAGE.height,
    alt,
  };
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  openGraphType?: "website" | "article";
  images?: ShareImage[];
  robots?: Metadata["robots"];
}

/**
 * Page openGraph replaces the layout object, so every page sets the
 * shared image here along with its own title, description, and url.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const images = input.images?.length ? input.images : [DEFAULT_OG_IMAGE];
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    ...(input.robots ? { robots: input.robots } : {}),
    openGraph: {
      type: input.openGraphType ?? "website",
      locale: "vi_VN",
      url: input.path,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [...images],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [...images],
    },
  };
}
