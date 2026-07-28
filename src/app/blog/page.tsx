import type { Metadata } from "next";
import BlogIndex from "../../components/BlogIndex";
import { getSortedPosts } from "../../lib/blog";

export const metadata: Metadata = {
  title: "Blog — Amazon Wholesale Guides | Apex Applications",
  description:
    "Practical, step-by-step guides on Amazon wholesale sourcing, ungating, purchase orders, reviews, and logistics from the Apex Applications team.",
  alternates: { canonical: "https://apexapplications.io/blog" },
};

export default function Page() {
  const posts = getSortedPosts();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Apex Applications Blog",
    url: "https://apexapplications.io/blog",
    description:
      "Practical, step-by-step guides on Amazon wholesale sourcing, ungating, purchase orders, reviews, and logistics.",
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://apexapplications.io/blog/${post.slug}`,
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
