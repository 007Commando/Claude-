import Image from "next/image";
import { Lock } from "lucide-react";

/**
 * Distributors a member can actually reach through the vault.
 *
 * Every name here is verified against src/data/distributors.ts — the strip is
 * only persuasive if it is true, and a name a seller cannot actually find in
 * their account would be the fastest way to lose them.
 *
 * KeHE reads clearly; the rest are blurred. The point is the shape of the
 * list, not the reading of it: a visitor sees one name they recognise and
 * seven more they cannot quite make out, which is the same feeling as the
 * locked rows inside the vault itself.
 *
 * To render a real logo for any of these, drop the file into
 * /public/images/distributors and add a `logo` path below.
 */
const DISTRIBUTORS: { name: string; logo?: string }[] = [
  { name: "KeHE", logo: "/images/distributors/kehe.png" },
  { name: "UNFI" },
  { name: "C&S Wholesale Grocers" },
  { name: "Bozzuto's" },
  { name: "Imperial Distributors" },
  { name: "Nassau Candy" },
  { name: "Redstone Foods" },
  { name: "Four Seasons Trading" },
];

export default function DistributorStrip() {
  return (
    <div className="mt-12">
      <p className="mb-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Names in the vault include
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DISTRIBUTORS.map(({ name, logo }, i) => {
          const locked = i > 0;
          return (
            <div
              key={name}
              className={
                "relative flex h-[74px] items-center justify-center overflow-hidden rounded-2xl border px-3 text-center shadow-sm " +
                (locked
                  ? "border-slate-200/70 bg-slate-50/60"
                  : "border-brand/30 bg-white shadow-[0_8px_24px_-12px_rgba(35,135,186,0.45)]")
              }
            >
              {logo ? (
                <Image
                  src={logo}
                  alt={name}
                  width={110}
                  height={34}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span
                  aria-hidden
                  className="select-none text-[13px] font-black leading-tight tracking-tight text-slate-500 blur-[5px]"
                >
                  {name}
                </span>
              )}

              {locked && (
                <span className="absolute bottom-2 right-2 text-slate-300">
                  <Lock className="h-3 w-3" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        389 vetted distributors in total. Three unlock the day you start —
        which three depends on your categories.
      </p>
    </div>
  );
}
