import type { ReactNode } from "react";
import Link from "next/link";
import type { ContentBlock } from "../lib/blog";

// Supports a minimal "[label](url)" markdown link syntax inside plain text
// blocks, so blog copy can cross-link to other guides/product pages without
// every block type needing to become JSX.
function renderInlineText(text: string): ReactNode[] {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const [, label, href] = match;
    nodes.push(
      <Link key={key++} href={href} className="text-brand font-semibold hover:underline">
        {label}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export default function BlogPostBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="text-2xl font-black text-slate-900 tracking-tight pt-4">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-lg font-bold text-slate-900 tracking-tight pt-2">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-base text-slate-600 leading-relaxed">
                {renderInlineText(block.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2.5 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-base text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-2.5" />
                    <span>{renderInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2.5 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-base text-slate-600 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {j + 1}
                    </span>
                    <span>{renderInlineText(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-brand pl-5 py-1 text-lg font-semibold text-slate-800 italic leading-relaxed"
              >
                {renderInlineText(block.text)}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
