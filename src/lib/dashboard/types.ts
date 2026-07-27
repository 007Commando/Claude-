/** Which GHL funnel a customer's email was found in — "unknown" if it matched none. */
export type LeadSource = "primewell" | "facebook" | "ash" | "unknown";

export interface StripeSubscriptionRow {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  planName: string;
  interval: string | null;
  amount: number;
  /** 0 for annual-interval subscriptions — see arrContribution instead. */
  mrrContribution: number;
  /** 0 for non-annual subscriptions — the true yearly amount for annual ones. */
  arrContribution: number;
  status: string;
  startedAt: string;
  /** ISO date of this subscription's next billing/invoice date, null if unavailable. */
  nextInvoiceAt: string | null;
  source: LeadSource;
}

export interface TrialRow {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  planName: string;
  interval: string | null;
  amount: number;
  /** What this trial would add to MRR if it converts (0 for annual plans). */
  predictedMrrContribution: number;
  /** What this trial would add to ARR if it converts (0 for non-annual plans). */
  predictedArrContribution: number;
  trialStartAt: string | null;
  trialEndAt: string | null;
  source: LeadSource;
}

export interface StripeMetrics {
  connected: boolean;
  error?: string;
  /** True monthly cash collected — excludes annual-plan subscribers, see arr. */
  mrr: number;
  /** True annual amount from annual-plan subscribers only (not amortized into mrr). */
  arr: number;
  activeSubscriptions: number;
  newCustomers30d: number;
  revenue7d: number;
  revenue30d: number;
  recentCharges: Array<{ id: string; amount: number; customerEmail: string | null; created: number }>;
  subscriptions: StripeSubscriptionRow[];
  /** True if there are more than 100 active subscriptions (Stripe's per-request page limit). */
  subscriptionsTruncated: boolean;
  trials: TrialRow[];
  /** True if there are more than 100 trialing subscriptions (Stripe's per-request page limit). */
  trialsTruncated: boolean;
  /** Sum of predictedMrrContribution across all trials — revenue added to MRR if every trial converts. */
  potentialMrr: number;
  /** Sum of predictedArrContribution across all trials — revenue added to ARR if every trial converts. */
  potentialArr: number;
}

export interface MailchimpMetrics {
  connected: boolean;
  error?: string;
  totalSubscribers: number;
  avgOpenRate: number;
  avgClickRate: number;
  subscribers30d: number;
  recentCampaigns: Array<{ id: string; title: string; sentAt: string | null; openRate: number; clickRate: number }>;
}

export interface MetaMetrics {
  connected: boolean;
  error?: string;
  spend7d: number;
  spend30d: number;
  impressions30d: number;
  clicks30d: number;
  cpc30d: number;
  campaigns: Array<{ id: string; name: string; spend: number; clicks: number; impressions: number }>;
}

export type Temperature = "cold" | "cool" | "warm" | "hot" | "very_hot";

export interface GhlLeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  joinedAt: string;
  isApexSubscriber: boolean;
  isPayingCustomer: boolean;
  customerSince: string | null;
  planName: string | null;
  ltv: number;
  /** False means isPayingCustomer/ltv/planName/customerSince are placeholders —
   * this row's Stripe status hasn't been checked yet (see /api/dashboard/primewell-stripe-status). */
  stripeChecked: boolean;
  temperature: Temperature | null;
  /** False means temperature is a placeholder — not checked yet (see /api/dashboard/lead-temperature). */
  temperatureChecked: boolean;
  /** True if the contact has opted out on any channel (SMS STOP keyword, email
   * unsubscribe, etc.) per GHL's dndSettings. Overrides temperature with "MIA"
   * regardless of any reply history, since they can no longer be messaged. */
  optedOut: boolean;
}

export interface GhlFunnel {
  connected: boolean;
  error?: string;
  totalLeads: number;
  newLeads7d: number;
  newLeads30d: number;
  crossConverted: number;
  /** True if crossConverted only checked a subset of totalLeads (Stripe-checking all of them on every load isn't practical — see route.ts AGGREGATE_STRIPE_CHECK_LIMIT). */
  crossConvertedTruncated: boolean;
  rows: GhlLeadRow[];
}

export interface DashboardSummary {
  stripe: StripeMetrics;
  mailchimp: MailchimpMetrics;
  meta: MetaMetrics;
  leads: import("./leads").LeadsSummary;
  signups: import("./signups").SignupsSummary;
  primewell: GhlFunnel;
  facebook: GhlFunnel;
  ash: GhlFunnel;
  blended: {
    costPerLead30d: number | null;
    costPerSale30d: number | null;
  };
  generatedAt: string;
}
