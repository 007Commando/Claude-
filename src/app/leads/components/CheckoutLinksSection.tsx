"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Lead } from "../../../lib/leads/model";
import { REP_PLAN_LABELS, appCheckoutLink, repSlug, signupLink, type RepPlan } from "../../../lib/leads/repLinks";

/**
 * Yearly checkout links for the signed-in rep, to paste into a text or the
 * setup call chat. Every link carries the rep's id (their first name, from the
 * Lead Desk sign-in), which is how the deal is credited. Hidden when there is
 * no usable rep id. Leads with an account get the in-app upgrade link, the
 * rest the signup link.
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
        {/* Someone with an account upgrades inside the app; a signup link
            would make them a second account. Everyone else signs up. */}
        {PLANS.map((plan) => {
          const href = (hasAccount && appCheckoutLink(plan, rep)) || signupLink(plan, rep);
          return <CopyLink key={plan} label={REP_PLAN_LABELS[plan]} href={href} />;
        })}
      </div>
    </div>
  );
}
