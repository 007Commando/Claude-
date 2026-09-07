import Link from "next/link";
import { ArrowRight, LayoutGrid, MapPin, ShieldCheck, Users } from "lucide-react";
import { Reveal } from "./Motion";
import s from "./ecosystem.module.css";

import analyticsScreen from "../../assets/profit-loss-dashboard.png.asset.json";
const prepPhoto = "/images/rewards-prep-center.png";
const distributionPhoto = "/images/rewards-distribution.png";

const pillars = [
  {
    kicker: "THE SOFTWARE SUITE",
    title: "One workspace for sourcing, purchasing, and profit.",
    body: "Master catalog, supplier management, purchase orders, and analytics — connected in a single platform built for Amazon wholesale.",
    stat: "5 tools",
    statLabel: "Green, Blue, Black, Red & Gold",
    href: "/#landing-features",
    linkLabel: "Explore the suite",
    art: <img src={analyticsScreen.url} alt="APEX analytics dashboard" width={1680} height={782} />,
    Icon: LayoutGrid,
  },
  {
    kicker: "THE PREP CENTER NETWORK",
    title: "21 vetted prep partners, nationwide.",
    body: "Skip the warehouse lease. Apex members unlock exclusive pricing — up to 30% off — with product insurance built in at every partner.",
    stat: "$4,800–6,000+",
    statLabel: "saved per seller, per year",
    href: "/prep-center-network",
    linkLabel: "Explore the network",
    art: <img src={prepPhoto} alt="Apex Prep Center Network" width={534} height={356} />,
    Icon: MapPin,
  },
  {
    kicker: "THE DISTRIBUTOR VAULT",
    title: "390+ distributors, ready to ungate you.",
    body: "Names, websites, and direct contact emails for vetted wholesale distributors across dozens of categories — an annual-member exclusive.",
    stat: "390+",
    statLabel: "vetted distributors",
    href: "/distributor-vault",
    linkLabel: "Explore the vault",
    art: <img src={distributionPhoto} alt="Apex Distributor Vault" width={496} height={356} />,
    Icon: ShieldCheck,
  },
];

export default function EcosystemPillars() {
  return (
    <Reveal>
      <section className={s.pillars} aria-labelledby="ecosystem-heading">
        <div className={s.pillarsHeading}>
          <span className={s.eyebrow}>MORE THAN SOFTWARE</span>
          <h2 id="ecosystem-heading">
            The complete support system for <em>Amazon wholesale sellers.</em>
          </h2>
          <p>
            Apex is software, plus a nationwide network built to back you up — sourcing partners,
            prep centers, and real people who&apos;ve scaled a wholesale business before. Built for
            sellers just getting started and operators ready to scale.
          </p>
        </div>

        <div className={s.pillarGrid}>
          {pillars.map(({ kicker, title, body, stat, statLabel, href, linkLabel, art, Icon }) => (
            <article key={kicker} className={s.pillarCard}>
              <div className={s.pillarArt}>{art}</div>
              <div className={s.pillarBody}>
                <span className={s.pillarKicker}>
                  <Icon size={14} aria-hidden="true" />
                  {kicker}
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
                <div className={s.pillarStat}>
                  <strong>{stat}</strong>
                  <span>{statLabel}</span>
                </div>
                <Link href={href}>
                  {linkLabel} <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={s.pillarFooterNote}>
          <Users size={16} aria-hidden="true" />
          <p>
            Plus: white-glove onboarding, a dedicated account manager, and exclusive video calls with
            7-figure Amazon sellers. See every{" "}
            <Link href="/rewards-benefits">Apex membership benefit</Link>.
          </p>
        </div>
      </section>
    </Reveal>
  );
}
