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

function CostChart({ block }: { block: Extract<ContentBlock, { type: "costChart" }> }) {
  const max = Math.max(...block.items.map((i) => i.price));
  return (
    <div className="my-8 rounded-[24px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8">
      <div className="text-sm font-black text-slate-900 mb-6">{block.title}</div>
      <div className="space-y-4">
        {block.items.map((item) => (
          <div key={item.label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-sm font-bold ${item.highlight ? "text-brand" : "text-slate-700"}`}>
                {item.label}
              </span>
              <span className={`text-sm font-black ${item.highlight ? "text-brand" : "text-slate-900"}`}>
                ${item.price}
                <span className="text-xs font-semibold text-slate-400">/mo</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.highlight ? "bg-brand" : "bg-slate-400"}`}
                style={{ width: `${Math.max((item.price / max) * 100, 3)}%` }}
              />
            </div>
            {item.note && <div className="text-xs text-slate-400 mt-1">{item.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
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
          case "image":
            return (
              <figure key={i} className="my-8">
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] bg-white">
                  <img src={block.src} alt={block.alt} className="w-full h-auto block" />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-slate-400 font-semibold mt-3">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {block.headers.map((h) => (
                        <th
                          key={h}
                          className="text-left font-black text-slate-900 px-4 py-3 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-t border-slate-100">
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "stats": {
            const gridColsClass =
              { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[
                Math.min(block.items.length, 4) as 1 | 2 | 3 | 4
              ] ?? "sm:grid-cols-4";
            return (
              <div key={i} className={`my-6 grid grid-cols-2 ${gridColsClass} gap-4`}>
                {block.items.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5 text-center"
                  >
                    <div className="text-2xl font-black text-brand mb-1">{stat.value}</div>
                    <div className="text-xs font-semibold text-slate-500 leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            );
          }
          case "costChart":
            return <CostChart key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
