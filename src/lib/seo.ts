import type { Metadata } from "next";
import { absoluteUrl } from "../config/site";

/**
 * A page's metadata in one call: title, description, a self-referencing
 * canonical, and matching Open Graph and Twitter fields.
 *
 * Pages used to set a title and a canonical and stop there, and inherited the
 * homepage's social title, description and URL from the root layout. Writing
 * all of them from the same three values means a shared link always describes
 * the page it points at.
 *
 * The image is set explicitly: a page that declares its own openGraph does not
 * inherit app/opengraph-image.tsx (checked in the built HTML), so without this
 * every page but the homepage shared with no picture.
 */
const DEFAULT_IMAGE = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: "Apex Applications: Amazon wholesale software",
};
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  extra,
}: {
  title: string;
  description: string;
  path: string;
  /** Shorter headline for social cards, when the title carries a brand suffix. */
  socialTitle?: string;
  extra?: Metadata;
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = socialTitle ?? title.replace(/\s*\|\s*Apex( Applications)?$/, "");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Apex Applications",
      locale: "en_US",
      title: ogTitle,
      description,
      url,
      images: [DEFAULT_IMAGE],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [DEFAULT_IMAGE.url] },
    ...extra,
  };
}
