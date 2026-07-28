import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getSortedPosts } from "../lib/blog";
import BlogCta from "./BlogCta";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogIndex() {
  const posts = getSortedPosts();

  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            Apex Blog
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Amazon Wholesale, Explained
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Practical, step-by-step guides on sourcing, ungating, purchase orders, and scaling an
            Amazon wholesale business, written by the Apex Applications team.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-[24px] bg-slate-50/70 border border-slate-100 p-7 hover:border-brand/30 hover:bg-white hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] transition-all"
            >
              <span className="inline-flex self-start text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1 mb-4 uppercase tracking-wide">
                {post.category}
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-2.5 group-hover:text-brand transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{post.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>{formatDate(post.publishedAt)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={12} />
                  {post.readingTime}
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                Read article <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <BlogCta />
      </div>
    </div>
  );
}
