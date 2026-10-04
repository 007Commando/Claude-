"use client";

import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ExternalLink,
  Flame,
  Gauge,
  Layers,
  Minus,
  Receipt,
  RotateCcw,
  Scale,
  Store,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { compute, priceRead, rankRead } from "../../lib/fba/calc";
import { estimateMonthlySales } from "../../lib/fba/estimate";
import { fulfillmentFee, referralFee } from "../../lib/fba/fees";
import { placementFee, type Region, type SplitPlan } from "../../lib/fba/placement";
import type { FbaProduct } from "../../lib/fba/types";
import { AnimatedNumber, Chip, money, Panel, percent, whole } from "./parts";
import SeasonHeatmap from "./SeasonHeatmap";

const SIZE_TIER: Record<NonNullable<FbaProduct["sizeTier"]>, string> = {
  standard_small: "Small standard",
  standard_large: "Large standard",
  small_oversize: "Small bulky",
  large_oversize: "Large bulky",
  special_oversize: "Extra-large",
};

const PLANS: { value: SplitPlan; label: string; note: string }[] = [
  { value: "optimized", label: "Amazon-optimized", note: "Amazon splits it. No placement fee." },
  { value: "minimal", label: "1 location", note: "One warehouse. You pay a placement fee." },
  { value: "partial2", label: "2 locations", note: "Split across two warehouses." },
  { value: "partial3", label: "3 locations", note: "Split across three warehouses." },
];

const REGIONS: { value: Region; label: string }[] = [
  { value: "us-east", label: "East" },
  { value: "us-central", label: "Central" },
  { value: "us-west", label: "West" },
];

const num = (text: string): number => {
  const value = Number(text.replace(/[$,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

const sizeText = (product: FbaProduct) => {
  const d = product.dimensions;
  if (!d) return null;
  const f = (n: number) => n.toFixed(1);
  return `${f(d.length)} x ${f(d.width)} x ${f(d.height)} ${d.unit === "inches" ? "in" : d.unit}`;
};

function Delta({ value, goodWhen }: { value: number | null; goodWhen: "up" | "down" }) {
  if (value === null || !Number.isFinite(value)) return null;
  const flat = Math.abs(value) < 0.02;
  const up = value > 0;
  const good = flat ? null : goodWhen === "up" ? up : !up;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const tone = good === null ? "slate" : good ? "green" : "red";
  return (
    <Chip tone={tone}>
      <Icon size={12} className="mr-1" />
      {flat ? "In line" : `${up ? "+" : ""}${(value * 100).toFixed(0)}%`}
    </Chip>
  );
}

function StatTile({
  icon,
  label,
  accent,
  children,
  foot,
  delay,
}: {
  icon: ReactNode;
  label: string;
  accent: string;
  children: ReactNode;
  foot: ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(15,23,42,0.14)]"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl ${accent}`} />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-slate-500">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">{icon}</span>
          <span className="text-[11px] font-black uppercase tracking-[0.14em]">{label}</span>
        </div>
        <div className="text-4xl font-black tracking-tight text-slate-950 sm:text-[2.6rem] sm:leading-none">{children}</div>
        <div className="mt-4 min-h-6 text-xs text-slate-500">{foot}</div>
      </div>
    </motion.div>
  );
}

function Bars({
  rows,
  format,
  best,
}: {
  rows: { label: string; value: number | null; strong?: boolean }[];
  format: (n: number) => string;
  /** Which end of the scale is better: it decides the bar colour. */
  best: "high" | "low";
}) {
  const present = rows.filter((r): r is { label: string; value: number; strong?: boolean } => r.value !== null);
  const max = Math.max(...present.map((r) => r.value), 1);
  const min = Math.min(...present.map((r) => r.value), max);
  return (
    <div className="space-y-3">
      {rows.map((row, index) => {
        if (row.value === null)
          return (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 font-bold text-slate-500">{row.label}</span>
              <span className="text-slate-300">No data</span>
            </div>
          );
        // Rank bars invert: a lower number is the stronger rank, so the bar
        // grows as the number shrinks.
        const width = best === "low" ? (min / row.value) * 100 : (row.value / max) * 100;
        return (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <span className={`w-24 shrink-0 font-bold ${row.strong ? "text-slate-900" : "text-slate-500"}`}>{row.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(width, 4)}%` }}
                transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${row.strong ? "bg-gradient-to-r from-blue-600 to-cyan-400" : "bg-slate-300"}`}
              />
            </div>
            <span className={`w-24 shrink-0 text-right font-black tabular-nums ${row.strong ? "text-slate-900" : "text-slate-600"}`}>
              {format(row.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  hint,
  prefix,
  value,
  onChange,
  placeholder,
  emphasis,
}: {
  label: string;
  hint?: string;
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emphasis?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span
        className={`mt-1.5 flex items-center rounded-xl border bg-white transition-colors focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 ${
          emphasis ? "border-blue-300" : "border-slate-200"
        }`}
      >
        {prefix && <span className="pl-3 text-sm font-bold text-slate-400">{prefix}</span>}
        <input
          // Typed rather than spun: a number input's scroll wheel quietly
          // changes a figure somebody is about to buy on.
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onFocus={(event) => event.target.select()}
          className="w-full bg-transparent px-2.5 py-2.5 text-sm font-bold tabular-nums text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300"
          aria-label={label}
        />
      </span>
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-black transition-all ${
            value === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function ResultView({ product, onReset }: { product: FbaProduct; onReset: () => void }) {
  const basePrice = product.price.buyBox ?? product.price.avg30 ?? product.price.avg90 ?? null;

  const [price, setPrice] = useState(basePrice !== null ? basePrice.toFixed(2) : "");
  const [cogs, setCogs] = useState("");
  const [prep, setPrep] = useState("");
  const [inbound, setInbound] = useState("");
  const [other, setOther] = useState("");
  const [units, setUnits] = useState("100");
  const [plan, setPlan] = useState<SplitPlan>("minimal");
  const [region, setRegion] = useState<Region>("us-central");
  const [fbaOverride, setFbaOverride] = useState("");
  const [placementOverride, setPlacementOverride] = useState("");

  const sellPrice = num(price);
  const haveCost = cogs.trim() !== "" && num(cogs) > 0;

  const looked = placementFee(product.weightPounds, product.sizeTier, region, plan);
  const placement = placementOverride.trim() !== "" ? num(placementOverride) : (looked ?? 0);

  const result = useMemo(
    () =>
      compute(product, {
        price: sellPrice,
        cogs: num(cogs),
        prep: num(prep),
        inbound: num(inbound),
        other: num(other),
        placement,
        fbaOverride: fbaOverride.trim() !== "" ? num(fbaOverride) : null,
        units: num(units) || 1,
      }),
    [product, sellPrice, cogs, prep, inbound, other, placement, fbaOverride, units],
  );

  const sales = estimateMonthlySales(product.rank.current ?? product.rank.avg30, product.category);
  const pRead = priceRead(product);
  const rRead = rankRead(product);
  const vsAvg = pRead?.vsAvg90 ?? null;

  const feeAtBuyBox =
    basePrice !== null
      ? referralFee(basePrice, product.category, product.subcategory) +
        (fulfillmentFee(basePrice, product.fulfillmentFee) ?? 0) +
        (looked ?? 0)
      : null;

  const hasAnyPrice = basePrice !== null;
  const hasFbaFee = result.fba !== null;

  const segments = [
    { key: "cogs", label: "Product cost", value: num(cogs), color: "bg-slate-800" },
    { key: "costs", label: "Prep, shipping, other", value: num(prep) + num(inbound) + num(other), color: "bg-slate-400" },
    { key: "referral", label: "Referral fee", value: result.referral, color: "bg-amber-400" },
    { key: "fba", label: "FBA fee", value: result.fba ?? 0, color: "bg-orange-500" },
    { key: "placement", label: "Placement fee", value: result.placement, color: "bg-rose-400" },
    { key: "profit", label: "Your profit", value: Math.max(result.profit, 0), color: "bg-emerald-500" },
  ];
  const segmentTotal = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const profitTone = !haveCost ? "text-slate-300" : result.profit > 0 ? "text-emerald-600" : result.profit < 0 ? "text-rose-600" : "text-slate-900";

  return (
    <div className="space-y-8">
      {/* The product */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center"
      >
        <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.title ?? product.asin} className="h-full w-full object-contain p-2" loading="eager" />
          ) : (
            <Boxes className="text-slate-300" size={40} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {product.brand && <Chip tone="blue">{product.brand}</Chip>}
            {product.category && <Chip>{product.category}</Chip>}
            {product.sizeTier && <Chip>{SIZE_TIER[product.sizeTier]}</Chip>}
            <Chip>ASIN {product.asin}</Chip>
          </div>
          <h2 className="text-xl font-black leading-snug tracking-tight text-slate-950 sm:text-2xl">
            {product.title ?? "Untitled listing"}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <a
              href={`https://www.amazon.com/dp/${product.asin}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700"
            >
              View on Amazon <ExternalLink size={14} />
            </a>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-800"
            >
              <RotateCcw size={14} /> Look up another
            </button>
          </div>
        </div>
      </motion.div>

      {/* The four numbers that matter most */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          delay={0.05}
          accent="bg-blue-500"
          icon={<Tag size={16} />}
          label="Buy Box price"
          foot={
            product.price.buyBox === null ? (
              <span>No Buy Box right now. Showing the 30-day average.</span>
            ) : vsAvg !== null ? (
              <span className="flex items-center gap-2">
                <Delta value={vsAvg} goodWhen="down" /> vs 90-day average
              </span>
            ) : (
              <span>Current winning price</span>
            )
          }
        >
          {basePrice !== null ? <AnimatedNumber value={basePrice} format={(n) => money(n)} /> : <span className="text-slate-300">n/a</span>}
        </StatTile>

        <StatTile
          delay={0.12}
          accent="bg-violet-500"
          icon={<Gauge size={16} />}
          label="Sales rank"
          foot={<span className="line-clamp-1">{product.category ? `in ${product.category}` : "Best Sellers Rank"}</span>}
        >
          {product.rank.current !== null ? (
            <>
              <span className="mr-0.5 text-slate-400">#</span>
              <AnimatedNumber value={product.rank.current} format={whole} />
            </>
          ) : (
            <span className="text-slate-300">n/a</span>
          )}
        </StatTile>

        <StatTile
          delay={0.19}
          accent="bg-emerald-500"
          icon={<Flame size={16} />}
          label="Est. units / month"
          foot={<span>Estimated from rank, shown as a range</span>}
        >
          {sales ? <span>{sales.label}</span> : <span className="text-slate-300">n/a</span>}
        </StatTile>

        <StatTile
          delay={0.26}
          accent="bg-amber-500"
          icon={<Receipt size={16} />}
          label="Amazon fees"
          foot={
            basePrice !== null && feeAtBuyBox !== null ? (
              <span>{percent(feeAtBuyBox / basePrice)} of the selling price</span>
            ) : (
              <span>Needs a price</span>
            )
          }
        >
          {feeAtBuyBox !== null ? <AnimatedNumber value={feeAtBuyBox} format={(n) => money(n)} /> : <span className="text-slate-300">n/a</span>}
        </StatTile>
      </div>

      {!hasAnyPrice && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-900">
          We have no price history for this listing yet. The size and fee details below are real. Enter a selling price in the
          calculator to work out profit.
        </div>
      )}

      {/* The year at a glance */}
      <SeasonHeatmap category={product.category} />

      {/* History */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Price history" title="Buy Box price over 30, 60 and 90 days">
          <Bars
            best="high"
            format={(n) => money(n)}
            rows={[
              { label: "Now", value: product.price.buyBox, strong: true },
              { label: "30-day avg", value: product.price.avg30 },
              { label: "60-day avg", value: product.price.avg60 },
              { label: "90-day avg", value: product.price.avg90 },
            ]}
          />
          {pRead && (
            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {Math.abs(pRead.vsAvg90) < 0.03 ? (
                <>The price is in line with its 90-day average, which points to a steady market.</>
              ) : pRead.vsAvg90 < 0 ? (
                <>
                  The price is <b className="text-slate-900">{Math.abs(pRead.vsAvg90 * 100).toFixed(0)}% below</b> its 90-day average. Check
                  whether that is a temporary dip before you plan around the lower price.
                </>
              ) : (
                <>
                  The price is <b className="text-slate-900">{(pRead.vsAvg90 * 100).toFixed(0)}% above</b> its 90-day average. Profit
                  planned at today&apos;s price may not hold if it settles back.
                </>
              )}
              {pRead.swing > 0.15 && <> Prices have moved by up to {(pRead.swing * 100).toFixed(0)}% across these windows.</>}
            </p>
          )}
        </Panel>

        <Panel eyebrow="Demand" title="Sales rank over 30, 60 and 90 days">
          <Bars
            best="low"
            format={(n) => `#${whole(n)}`}
            rows={[
              { label: "Now", value: product.rank.current, strong: true },
              { label: "30-day avg", value: product.rank.avg30 },
              { label: "60-day avg", value: product.rank.avg60 },
              { label: "90-day avg", value: product.rank.avg90 },
            ]}
          />
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            A longer bar is a stronger rank, because a lower number is better.{" "}
            {rRead &&
              (rRead.change < -0.1 ? (
                <>
                  The 30-day average is <b className="text-slate-900">{Math.abs(rRead.change * 100).toFixed(0)}% better</b> than the
                  90-day one: demand has been picking up.
                </>
              ) : rRead.change > 0.1 ? (
                <>
                  The 30-day average is <b className="text-slate-900">{(rRead.change * 100).toFixed(0)}% worse</b> than the 90-day one:
                  demand has been cooling.
                </>
              ) : (
                <>The rank has held steady, which is what you want from a product you plan to reorder.</>
              ))}
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Competition" title="Who else is selling it">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Sellers", value: product.sellers.total },
              { label: "FBA sellers", value: product.sellers.fba },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-3xl font-black text-slate-950">{item.value ?? "n/a"}</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">{item.label}</div>
              </div>
            ))}
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex h-9 items-center justify-center">
                {product.sellers.amazonOnListing === null ? (
                  <span className="text-3xl font-black text-slate-950">n/a</span>
                ) : (
                  <Chip tone={product.sellers.amazonOnListing ? "amber" : "green"}>
                    {product.sellers.amazonOnListing ? "Yes" : "No"}
                  </Chip>
                )}
              </div>
              <div className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">Amazon sells it</div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-500">
            More sellers means the Buy Box is shared more thinly. When Amazon sells the product itself, winning the Buy Box is harder
            and the price tends to be tighter.
          </p>
        </Panel>

        <Panel eyebrow="Size and weight" title="What decides the FBA fee">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Size tier", value: product.sizeTier ? SIZE_TIER[product.sizeTier] : "n/a" },
              { label: "Shipping weight", value: product.weightPounds !== null ? `${product.weightPounds.toFixed(2)} lb` : "n/a" },
              { label: "Dimensions", value: sizeText(product) ?? "n/a" },
              { label: "Pack size", value: product.bundle ? `${product.bundle}` : "n/a" },
            ].map((row) => (
              <div key={row.label} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">{row.label}</dt>
                <dd className="mt-1 font-black text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
          {product.hazmat && (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              This product is flagged as hazmat. Hazmat products can carry extra requirements and fees that this calculator does not
              include.
            </p>
          )}
        </Panel>
      </div>

      {/* The calculator */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">Profit calculator</p>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">What would you actually keep?</h3>
          <p className="mt-1 text-sm text-slate-500">
            Enter what the product costs you. Everything else is filled in from the listing, and you can change any of it.
          </p>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <Field label="Selling price" prefix="$" value={price} onChange={setPrice} placeholder="0.00" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  { label: "Buy Box", value: product.price.buyBox },
                  { label: "30d avg", value: product.price.avg30 },
                  { label: "60d avg", value: product.price.avg60 },
                  { label: "90d avg", value: product.price.avg90 },
                ]
                  .filter((p): p is { label: string; value: number } => p.value !== null)
                  .map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPrice(p.value.toFixed(2))}
                      className={`rounded-full border px-3 py-1 text-[11px] font-black transition-colors ${
                        Math.abs(sellPrice - p.value) < 0.005
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {p.label} {money(p.value)}
                    </button>
                  ))}
              </div>
            </div>

            <Field
              label="Your product cost, per unit"
              prefix="$"
              value={cogs}
              onChange={setCogs}
              placeholder="What you pay your supplier"
              emphasis
            />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Prep and labels" prefix="$" value={prep} onChange={setPrep} placeholder="0.00" />
              <Field label="Shipping to Amazon" prefix="$" value={inbound} onChange={setInbound} placeholder="0.00" />
              <Field label="Other costs" prefix="$" value={other} onChange={setOther} placeholder="0.00" hint="Storage, ads, returns" />
              <Field label="Units" value={units} onChange={setUnits} placeholder="100" hint="For the totals" />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Inbound placement</span>
              </div>
              <Segmented options={PLANS.map((p) => ({ value: p.value, label: p.label }))} value={plan} onChange={setPlan} label="Shipment split" />
              <p className="text-[11px] text-slate-400">{PLANS.find((p) => p.value === plan)?.note}</p>
              {plan !== "optimized" && (
                <>
                  <Segmented options={REGIONS} value={region} onChange={setRegion} label="Inbound region" />
                  <p className="text-[11px] text-slate-400">
                    {looked === null
                      ? "We do not have a weight for this product, so enter the placement fee below."
                      : `Estimated ${money(looked)} per unit for this size, weight and region.`}
                  </p>
                </>
              )}
            </div>

            <details className="group rounded-2xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                Use Amazon&apos;s own fee quote
              </summary>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field
                  label="FBA fee override"
                  prefix="$"
                  value={fbaOverride}
                  onChange={setFbaOverride}
                  placeholder={result.fba !== null ? result.fba.toFixed(2) : "0.00"}
                  hint="Replaces the looked-up fee"
                />
                <Field
                  label="Placement override"
                  prefix="$"
                  value={placementOverride}
                  onChange={setPlacementOverride}
                  placeholder={looked !== null ? looked.toFixed(2) : "0.00"}
                  hint="Per unit"
                />
              </div>
            </details>
          </div>

          {/* Results */}
          <div className="space-y-5" aria-live="polite">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.2)]">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Profit per unit</p>
              <div className={`mt-1 text-6xl font-black tracking-tight sm:text-7xl ${profitTone}`}>
                {haveCost ? <AnimatedNumber value={result.profit} format={(n) => money(n)} /> : "$ --"}
              </div>
              {!haveCost && (
                <p className="mt-2 text-sm text-slate-500">
                  Enter your product cost and your profit appears here. The fees below are already worked out.
                </p>
              )}
              {haveCost && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Margin", value: percent(result.margin, 1) },
                    { label: "ROI", value: percent(result.roi, 1) },
                    { label: "Break-even price", value: result.breakEven === null ? "n/a" : money(result.breakEven) },
                    { label: `Profit on ${num(units) || 1} units`, value: money(result.totalProfit, 0) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 p-3.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</div>
                      <div className="mt-1 text-lg font-black tabular-nums text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Where the {money(sellPrice)} goes</p>
                {haveCost && result.profit < 0 && <Chip tone="red">Selling at a loss</Chip>}
              </div>
              <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
                {segments
                  .filter((s) => s.value > 0)
                  .map((s, index) => (
                    <motion.div
                      key={s.key}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.value / segmentTotal) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full ${s.color}`}
                      title={`${s.label}: ${money(s.value)}`}
                    />
                  ))}
              </div>
              <ul className="mt-5 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
                {segments
                  .filter((s) => s.key !== "profit" || haveCost)
                  .map((s) => (
                    <li key={s.key} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                        {s.label}
                      </span>
                      <span className="font-black tabular-nums text-slate-900">
                        {s.key === "profit" ? money(result.profit) : money(s.value)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <Scale size={16} className="text-slate-400" />
                <p className="text-sm font-black text-slate-900">How the fees are worked out</p>
              </div>
              <dl className="space-y-3 text-sm leading-relaxed text-slate-500">
                <div>
                  <dt className="font-black text-slate-800">
                    Referral fee: {money(result.referral)}{" "}
                    <span className="font-bold text-slate-400">({sellPrice > 0 ? percent(result.referral / sellPrice, 1) : "n/a"} of price)</span>
                  </dt>
                  <dd>
                    Amazon&apos;s cut of every sale. The rate depends on the category{product.category ? ` (${product.category})` : ""}, with a
                    minimum of $0.30 on most categories.
                  </dd>
                </div>
                <div>
                  <dt className="font-black text-slate-800">
                    FBA fulfillment fee: {hasFbaFee ? money(result.fba) : "n/a"}
                  </dt>
                  <dd>
                    Picking, packing and shipping to the customer. It follows the size tier and weight, and steps up above $10 and $50
                    selling price.
                  </dd>
                </div>
                <div>
                  <dt className="font-black text-slate-800">Inbound placement fee: {money(result.placement)}</dt>
                  <dd>
                    Charged per unit when you send stock to fewer warehouses than Amazon would choose.{" "}
                    {plan === "optimized"
                      ? "Amazon-optimized splits carry no fee."
                      : "Choosing Amazon-optimized splits above removes it."}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
                Not included: monthly storage, aged-inventory surcharges, returns processing, advertising and taxes. Add them to
                &quot;Other costs&quot; if you want them counted. These are estimates built from a database snapshot, so confirm the
                figures in Seller Central before you buy.
              </p>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
              <div>
                <p className="text-lg font-black tracking-tight">Check a whole supplier list the same way.</p>
                <p className="text-sm text-slate-400">Apex scans a catalog and builds the purchase order for you.</p>
              </div>
              <Link
                href={`/auth?mode=signup&utm_source=apex-site&utm_medium=free-tool&utm_campaign=fba-calculator&utm_content=${product.asin}-result`}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-slate-950 transition-transform hover:scale-[1.03]"
              >
                Create free account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <Store size={13} /> Prices, ranks and sizes are a snapshot from Apex&apos;s product database and change daily.
      </p>
    </div>
  );
}
