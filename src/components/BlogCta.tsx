import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogCta() {
  return (
    <div className="my-12 rounded-[28px] bg-brand p-8 sm:p-10 text-center">
      <div className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-3">
        Apex Applications
      </div>
      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
        Ready to put this into practice?
      </h3>
      <p className="text-white/90 mb-7 max-w-lg mx-auto">
        Apex Black, Blue, Green &amp; Red connect sourcing, purchasing, and profit tracking into
        one suite. Start your 7-day free trial, no card charged until it ends.
      </p>
      <Link
        href="/auth?mode=signup&plan=starter&period=monthly"
        className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-3.5 rounded-[16px] font-black text-sm shadow-lg hover:scale-[1.02] transition-all uppercase tracking-wide"
      >
        Start Free Trial <ArrowRight size={16} />
      </Link>
    </div>
  );
}
