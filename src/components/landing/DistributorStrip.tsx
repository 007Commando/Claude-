import Image from "next/image";

/**
 * Distributors a member can actually reach through the vault.
 *
 * Every name here is verified against src/data/distributors.ts — the strip is
 * only persuasive if it is true, and a name a seller cannot actually find in
 * their account would be the fastest way to lose them.
 *
 * KeHE ships as an image because we hold the asset; the rest render as
 * wordmarks rather than invented logo art. Drop real files into
 * /images/distributors and add them to `logo` to swap any of them in.
 */
const DISTRIBUTORS: { name: string; logo?: string; note: string }[] = [
  { name: "KeHE", logo: "/images/distributors/kehe.png", note: "Natural & specialty grocery" },
  { name: "UNFI", note: "Natural & organic" },
  { name: "C&S Wholesale Grocers", note: "Grocery" },
  { name: "Bozzuto's", note: "Grocery & HBA" },
  { name: "Imperial Distributors", note: "HBA & general merchandise" },
  { name: "Nassau Candy", note: "Candy & snacks" },
  { name: "Redstone Foods", note: "Candy & snacks" },
  { name: "Four Seasons Trading", note: "General merchandise" },
];

export default function DistributorStrip() {
  return (
    <div className="mt-12">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">
        Names in the vault include
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DISTRIBUTORS.map(({ name, logo, note }) => (
          <div
            key={name}
            title={note}
            className="group flex h-[74px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
          >
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={110}
                height={34}
                className="h-7 w-auto object-contain opacity-70 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0"
              />
            ) : (
              <span className="text-[13px] font-black leading-tight tracking-tight text-slate-500 transition-colors group-hover:text-slate-800">
                {name}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        389 vetted distributors in total. Which three open first depends on your
        categories.
      </p>
    </div>
  );
}
