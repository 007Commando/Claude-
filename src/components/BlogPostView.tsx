import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "../lib/blog";
import { getSortedPosts } from "../lib/blog";
import BlogPostBody from "./BlogPostBody";
import BlogCta from "./BlogCta";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogPostView({ post }: { post: BlogPost }) {
  const midpoint = Math.ceil(post.content.length / 2);
  const firstHalf = post.content.slice(0, midpoint);
  const secondHalf = post.content.slice(midpoint);

  const related = getSortedPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <span className="inline-flex text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1 mb-5 uppercase tracking-wide">
          {post.category}
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-slate-400 font-semibold mb-10 pb-10 border-b border-slate-100">
          <span>Apex Applications Team</span>
          <span>·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            {post.readingTime}
          </span>
        </div>

        <BlogPostBody blocks={firstHalf} />
        <BlogCta />
        <BlogPostBody blocks={secondHalf} />
        <BlogCta />

        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">More from the blog</h2>
            <div className="space-y-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block rounded-2xl bg-slate-50/70 border border-slate-100 p-5 hover:border-brand/30 hover:bg-white transition-all"
                >
                  <div className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors">
                    {p.title}
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand">
                    Read article <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
