import Link from "next/link";
import { Boxes, GraduationCap, MapPin, Warehouse } from "lucide-react";

/**
 * Only figures that exist in the product are used here.
 *
 * There is deliberately no seller count, revenue-managed number or testimonial:
 * inventing those is the fastest way to lose the trust this page is trying to
 * build, and they are the owner's to supply. The slot for them is below.
 */
const NUMBERS = [
  { icon: Warehouse, value: "389", label: "Vetted distributors", sub: "with direct contacts" },
  { icon: MapPin, value: "21", label: "Prep centres", sub: "nationwide, member pricing" },
  { icon: Boxes, value: "5", label: "Connected tools", sub: "one workspace" },
  { icon: GraduationCap, value: "7 days", label: "Free trial", sub: "3 distributors included" },
];

export default function ProofV2() {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {NUMBERS.map(({ icon: Icon, value, label, sub }) => (
          <div key={label} className="text-center">
            <Icon className="mx-auto size-5 text-[#2387ba]" />
            <p className="mt-2.5 text-2xl font-bold tracking-tight text-[#0B1B2B] sm:text-3xl">
              {value}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#0B1B2B]">{label}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500">
        Trusted by Amazon wholesale sellers who would rather spend the day
        buying inventory than reconciling spreadsheets.{" "}
        <Link href="/contact-us" className="font-medium text-[#2387ba] underline-offset-2 hover:underline">
          Talk to the team
        </Link>
      </p>
    </section>
  );
}
