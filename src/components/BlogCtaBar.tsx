import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function BlogCtaBar() {
  return (
    <Link
      href="/auth?mode=signup&plan=starter&period=monthly"
      className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 px-5 sm:px-6 py-4 sm:py-4 hover:bg-slate-800 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" fill="currentColor" />
        </div>
        <div>
          <div className="text-sm font-black text-white">Start your 7-day free trial</div>
          <div className="text-xs text-slate-400">No card charged until it ends. Cancel anytime.</div>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/10 group-hover:bg-white/20 rounded-xl px-4 py-2.5 transition-colors w-full sm:w-auto justify-center">
        Get Started <ArrowRight size={14} />
      </span>
    </Link>
  );
}
