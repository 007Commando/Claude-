import { List } from "lucide-react";
import type { ContentBlock } from "../lib/blog";
import { getHeadings } from "../lib/blog";

export default function BlogToc({ content }: { content: ContentBlock[] }) {
  const headings = getHeadings(content);
  if (headings.length < 3) return null;

  return (
    <nav className="mb-10 rounded-2xl bg-slate-50/70 border border-slate-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide mb-3">
        <List size={14} className="text-brand" />
        In this article
      </div>
      <ol className="space-y-2">
        {headings.map((h, i) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="text-sm text-slate-600 hover:text-brand transition-colors leading-snug"
            >
              <span className="text-slate-400 font-semibold mr-1.5">{i + 1}.</span>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
