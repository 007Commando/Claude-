import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The visual language of the original Apex landing page, extracted so the two
 * offer pages share it rather than each inventing their own.
 *
 * Left-aligned bold type, a coloured USP eyebrow, dense checkmark lists and a
 * device frame around a real product screen — the parts that made that page
 * read as a product rather than a brochure.
 */

export function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export function Eyebrow({
  children,
  tone = "brand",
  icon,
}: {
  children: ReactNode;
  tone?: "brand" | "purple" | "emerald";
  icon?: ReactNode;
}) {
  const tones = {
    brand: "bg-sky-100 text-sky-700",
    purple: "bg-purple-100 text-purple-600",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div
      className={`mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}
    >
      {icon}
      {children}
    </div>
  );
}

/** Bold lead line with a supporting sentence, as on the original page. */
export function CheckList({
  items,
}: {
  items: { title: string; detail: string }[];
}) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 shadow-sm">
            <CheckCircle2 className="size-4 text-brand" />
          </div>
          <div>
            <span className="mb-0.5 block text-sm font-bold text-slate-800">
              {item.title}
            </span>
            <span className="text-sm text-slate-600">{item.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Device frame for a product screen.
 *
 * Renders a labelled placeholder until a real screenshot is dropped in, rather
 * than shipping a broken image — and so it is obvious which assets are still
 * outstanding.
 */
export function ProductFrame({
  src,
  alt,
  caption,
}: {
  src?: string;
  alt: string;
  caption?: string;
}) {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
        {src ? (
          <img src={src} alt={alt} className="h-auto w-full rounded-[34px]" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-[34px] bg-gradient-to-br from-slate-50 to-slate-100 px-6 text-center">
            <p className="text-sm font-medium text-slate-400">{alt}</p>
          </div>
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand/15 blur-[60px]"
      />
      {caption && (
        <p className="mt-3 text-center text-xs text-slate-400">{caption}</p>
      )}
    </div>
  );
}
