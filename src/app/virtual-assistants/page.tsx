import type { Metadata } from "next";

import ApexVasPromo from "../../components/ApexVasPromo";

/**
 * The VA offer, on the URL that search traffic lands on.
 *
 * This was a long sales page: a freelancer-versus-assistant argument, the work
 * that eats a seller's week, the guarantee, and the rate cards. It is now the
 * promotional page, leading on the trial and asking for one thing, a booked
 * meeting. The previous version is one `git show` away if any of that copy is
 * wanted back.
 *
 * Still indexed, unlike the other two. It is the canonical VA page, it is in
 * the sitemap, and the site footer links to it. Note that it carries no nav
 * or footer now, which is a deliberate trade: fewer exits from the page
 * against fewer internal links out of it.
 */
export const metadata: Metadata = {
  title: "14 days free with a professional Amazon VA | Apex Applications",
  description:
    "Put a trained Amazon wholesale VA to work in your business free for 14 days. Account audits, product research, supplier management, restocking, repricing and more, with 20+ years of Amazon experience across the team.",
  alternates: { canonical: "https://www.apexapplications.io/virtual-assistants" },
};

export default function Page() {
  return <ApexVasPromo />;
}
