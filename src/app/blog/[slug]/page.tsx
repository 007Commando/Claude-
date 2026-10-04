import type { Metadata } from "next";
import { notFound } from "next/navigation";
import apexBullLogo from "../../../assets/apex-bull-logo.png.asset.json";
import BlogPostView from "../../../components/BlogPostView";
import { absoluteUrl } from "../../../config/site";
import { getAllSlugs, getFaq, getLeadImage, getPostBySlug, postModified } from "../../../lib/blog";

/** A post's lead image as an absolute URL, which social cards and structured data need. */
const leadImage = (content: Parameters<typeof getLeadImage>[0]): string | undefined => {
  const src = getLeadImage(content);
  if (!src) return undefined;
  return src.startsWith("http") ? src : absoluteUrl(src);
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://www.apexapplications.io/blog/${post.slug}`;
  // The social card is the opengraph-image beside this file, drawn from the title.
  return {
    title: post.seoTitle ?? (post.title.length <= 46 ? `${post.title} | Apex Applications` : post.title),
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: postModified(post),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `https://www.apexapplications.io/blog/${post.slug}`;
  const image = leadImage(post.content);
  const faq = getFaq(post.content);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: postModified(post),
    url,
    ...(image ? { image: [image] } : {}),
    articleSection: post.category,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Apex Applications", url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: "Apex Applications",
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: absoluteUrl(apexBullLogo.url) },
    },
  };

  // Built from the post's own FAQ section, so the markup always matches the page.
  const faqJsonLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  // Breadcrumbs tell Google where a post sits; without them a blog URL is an
  // orphan in the result page.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.apexapplications.io/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.apexapplications.io/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <BlogPostView post={post} />
    </>
  );
}
