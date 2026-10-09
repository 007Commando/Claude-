"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Lead } from "../../../lib/leads/model";
import { REP_PLAN_LABELS, appCheckoutLink, repSlug, signupLink, type RepPlan } from "../../../lib/leads/repLinks";

/**
 * Yearly checkout links for the signed-in rep, to paste into a text or the
 * setup call chat. Every link carries the rep's id (their first name, from the
 * Lead Desk sign-in), which is how the deal is credited. Hidden when there is
 * no usable rep id. Leads that already have an account get the in-app link
 * too once appCheckoutLink() knows its format.
 */

const PLANS: RepPlan[] = ["plus", "pro"];

function CopyLink({ label, href }: { label: string; href: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="ld-links-row">
      <span className="ld-links-label">{label}</span>
      <span className="ld-links-url" title={href}>
        {href}
      </span>
      <button
        type="button"
        className="ld-btn"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          } catch {
            // Clipboard blocked: the link stays visible to copy by hand.
          }
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function CheckoutLinksSection({ lead, repName }: { lead: Lead; repName: string }) {
  const rep = repSlug(repName);
  if (!rep) return null;
  const hasAccount = lead.stage !== "lead";

  return (
    <div className="ld-drawer-section">
      <div className="ld-drawer-section-title">Yearly checkout links</div>
      <div className="ld-links">
        {PLANS.map((plan) => (
          <CopyLink key={`signup-${plan}`} label={REP_PLAN_LABELS[plan]} href={signupLink(plan, rep)} />
        ))}
        {hasAccount &&
          PLANS.map((plan) => {
            const href = appCheckoutLink(plan, rep);
            return href ? <CopyLink key={`app-${plan}`} label={`${REP_PLAN_LABELS[plan]} (in the app)`} href={href} /> : null;
          })}
      </div>
    </div>
  );
}
