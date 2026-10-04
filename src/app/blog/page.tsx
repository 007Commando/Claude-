import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import BlogIndex from "../../components/BlogIndex";
import { getSortedPosts } from "../../lib/blog";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Wholesale Guides & Seller Resources | Apex",
  description:
    "Practical, step-by-step guides on Amazon wholesale sourcing, ungating, purchase orders, reviews and logistics from the Apex Applications team.",
  path: "/blog",
});

export default function Page() {
  const posts = getSortedPosts();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Apex Applications Blog",
    url: "https://www.apexapplications.io/blog",
    description:
      "Practical, step-by-step guides on Amazon wholesale sourcing, ungating, purchase orders, reviews, and logistics.",
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://www.apexapplications.io/blog/${post.slug}`,
      datePublished: post.publishedAt,
      description: post.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BlogIndex />
    </>
  );
}
