import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../../lib/og/card";
import { getAllSlugs, getPostBySlug } from "../../../lib/blog";

export const alt = "Apex Applications blog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return ogCard({ eyebrow: post?.category ?? "Blog", title: post?.title ?? "Apex Applications blog" });
}
