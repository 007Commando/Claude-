"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Barcode, BookOpen, Check, Database, FileText, GraduationCap, Layers, Package, Search, Star, TrendingUp, Users, Wallet } from "lucide-react";
import { Reveal } from "./Motion";
import PhoneLessons from "./PhoneLessons";
import SiteFooter from "../site/SiteFooter";
import s from "./full-layout.module.css";

const signup = "/auth?mode=signup&plan=starter&period=monthly";
const products = [
 {name:"Insulated tumbler",icon:"🥤",cost:8,profit:4.8,sales:320},
 {name:"Wireless headphones",icon:"🎧",cost:18,profit:9,sales:185},
 {name:"Desk lamp",icon:"💡",cost:12,profit:5.4,sales:240},
 {name:"Training sneakers",icon:"👟",cost:25,profit:10,sales:160},
 {name:"Travel backpack",icon:"🎒",cost:16,profit:8.8,sales:210},
 {name:"Kitchen organizer",icon:"🧺",cost:10,profit:6.5,sales:275},
];
const orbit = [
  { label: "Master catalog", Icon: Database, href: "/features/green" },
  { label: "UPC scanner", Icon: Barcode, href: "/features/green" },
  { label: "Suppliers", Icon: Users, href: "/features/blue" },
  { label: "Purchase orders", Icon: Package, href: "/features/blue" },
  { label: "Analytics", Icon: TrendingUp, href: "/features/blue" },
  { label: "APEX University", Icon: GraduationCap, href: "/features/black" },
];
const rows = [
  ["Product sourcing", "Master catalog + UPC scanner", "APEX Green"],
  ["Supplier management", "Vendor workspace", "APEX Blue"],
  ["Purchase orders", "Purchasing + discrepancy review", "APEX Blue"],
  ["Profitability", "Analytics + operating expenses", "APEX Blue"],
  ["Review tools", "Review Booster", "APEX Black"],
  ["Learning", "University + resource library", "APEX Black"],
];

export default function FullLayout() {
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const update = () => {
      const pricing = document.getElementById("landing-plans");
      const comparison=document.getElementById("seller-comparison")?.getBoundingClientRect();
      const comparisonVisible=!!comparison && comparison.top < window.innerHeight && comparison.bottom > 0;
      setShowBar(!comparisonVisible && window.scrollY > 650 && (!pricing || pricing.getBoundingClientRect().top > window.innerHeight * .7));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <>
    <section className={s.productStrip} aria-label="Sample product opportunities">
      <span className={s.eyebrow}>A LOOK INSIDE THE WORKFLOW</span>
      <h2>Small products. <em>Big possibilities.</em></h2>
      <p>Explore the numbers behind your next sourcing decision.</p>
      <div className={s.productRail}><div className={s.productTrack}>{[...products,...products].map((p,i)=><article key={i} className={s.productCard} aria-hidden={i>=products.length||undefined}>
        <div className={s.productArt}><span>{p.icon}</span><small>DEMO PRODUCT</small></div><h3>{p.name}</h3>
        <div className={s.productStats}><div><small>Cost / unit</small><b>${p.cost.toFixed(2)}</b></div><div><small>Profit / unit</small><b>${p.profit.toFixed(2)}</b></div></div>
        <div className={s.productRoi}><strong>{Math.round(p.profit/p.cost*100)}% <small>ROI</small></strong><span>{p.sales} sales/mo</span></div>
        <svg viewBox="0 0 220 35" aria-hidden="true"><path d="M0 30 L20 25 L40 29 L60 17 L80 22 L100 13 L120 18 L140 8 L160 13 L180 4 L200 8 L220 2"/></svg>
      </article>)}</div></div><small className={s.demoNote}>Illustrative demo data. Products, profits, sales and ROI are fictional examples, not actual results or forecasts.</small>
    </section>

    <Reveal><section className={s.phoneSection} aria-labelledby="learning-heading">
      <div className={s.phoneCopy}>
        <span className={s.pill}><GraduationCap size={19} /> APEX University <span>+</span> Resources</span>
        <h2 id="learning-heading">Your business,<br /><em>one lesson<br />ahead.</em></h2>
        <p>Build your wholesale knowledge, keep useful resources close, and turn your next lesson into your next step.</p>

        <ul>
          <li><BookOpen /><div><strong>Learn the foundations</strong><span>Explore the APEX University wholesale curriculum.</span></div></li>
          <li><Layers /><div><strong>Keep your resources together</strong><span>Find guides and templates in the resource library.</span></div></li>
          <li><TrendingUp /><div><strong>Put your learning to work</strong><span>Bring your next step into the APEX suite.</span></div></li>
        </ul>
        <Link className={s.textLink} href="/features/black">Explore APEX University <ArrowRight size={19} /></Link>
      </div>
      <div className={s.phoneWrap}>
        <div className={s.phone}><span className={s.phoneMute} aria-hidden="true"/><span className={s.phoneVolume} aria-hidden="true"/><span className={s.phonePower} aria-hidden="true"/>
          <div className={s.phoneInner}><div className={s.phoneTop}><span>9:41</span><i /><span>▰</span></div>
          <div className={s.phoneBrand}>APEX <small>UNIVERSITY</small></div>
          <div className={s.phoneScreen}>
            <PhoneLessons />
            <Link href="/features/black">Explore learning <ArrowRight size={16} /></Link>
          </div>
          <div className={s.phoneHome} /></div>
        </div>
        <p className={s.caption}>Illustrative learning preview</p>
      </div>
    </section></Reveal>

    <section className={s.orbitSection} aria-labelledby="orbit-heading">
      <div className={s.orbitCanvas}>
        <div className={s.outerRing} /><svg className={s.flowPaths} viewBox="0 0 1000 667" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="500" cy="333" rx="280" ry="173"/><ellipse cx="500" cy="333" rx="440" ry="260"/></svg><div className={s.innerRing} />
        <span className={s.orbitLabel}>YOUR WHOLESALE WORKSPACE</span>
        <div className={s.orbitCenter}><h2 id="orbit-heading">Everything connected<br /> around your business</h2><p>Sourcing, suppliers, purchasing, and profitability.<br />Keep your next step in the same orbit.</p></div>
        {orbit.map(({label,Icon,href},i) => <Link key={label} href={href} className={`${s.orbitNode} ${s[`node${i}`]}`}><span><Icon size={40} strokeWidth={1.6} /></span><strong>{label}</strong></Link>)}
        <div className={`${s.outerNode} ${s.outerLeft}`}><FileText size={30} /><span>Supplier catalogs</span></div>
        <div className={`${s.outerNode} ${s.outerRight}`}><Wallet size={30} /><span>Business expenses</span></div>
      </div>
    </section>

    <section id="seller-comparison" className={s.comparison} aria-labelledby="comparison-heading">
      <div className={s.comparisonHeading}><div><span className={s.eyebrow}>COMPARE YOUR SELLER WORKSPACE</span><h2 id="comparison-heading">Find the right tools.<br />Build your next chapter.</h2></div><p>See how APEX and established Amazon seller tools approach sourcing, operations, and profitability.</p></div>
      <div className={s.tableScroll} tabIndex={0} role="region" aria-label="Amazon seller software comparison, scroll horizontally on smaller screens">
        <table className={s.competitors}><thead><tr><th scope="col">Workflow focus</th><th scope="col" className={s.highlight}><small>CONNECTED SUITE</small><strong>APEX</strong><span>7-day free trial</span><span>From $149.99/mo</span></th><th scope="col"><a href="https://selleramp.com/features/" target="_blank" rel="noreferrer">SellerAmp ↗</a><small>Sourcing analysis</small></th><th scope="col"><a href="https://www.threecolts.com/seller-365/inventorylab" target="_blank" rel="noreferrer">InventoryLab ↗</a><small>Listing & operations</small></th><th scope="col"><a href="https://sellerboard.com/" target="_blank" rel="noreferrer">sellerboard ↗</a><small>Profit analytics</small></th></tr></thead>
        <tbody>{[
          {label:"Product sourcing",Icon:Search,cells:["Master catalog + UPC scanner","ROI, fees & eligibility analysis","Scoutify sourcing tools","Product profitability analysis"],levels:[1,1,1,2]},
          {label:"Supplier management",Icon:Users,cells:["Vendor workspace","Not verified in reviewed sources","Supplier reporting","Purchase-order planning"],levels:[1,0,2,2]},
          {label:"Purchase orders",Icon:Package,cells:["Purchasing + discrepancy review","Not verified in reviewed sources","Buy lists and shipment workflow","Purchase-order planning"],levels:[1,0,2,1]},
          {label:"Profit analytics",Icon:TrendingUp,cells:["Analytics + operating expenses","Per-product calculator","Accounting and profitability reports","Profit dashboard, COGS and expenses"],levels:[1,2,1,1]},
          {label:"Inventory",Icon:Database,cells:["Inventory restocking","Not verified in reviewed sources","Inventory and FBA shipments","Inventory and restock management"],levels:[1,0,1,1]},
          {label:"Learning",Icon:GraduationCap,cells:["APEX University + library","Tutorials and knowledge base","Support and training resources","Blog and help resources"],levels:[1,2,2,2]},
        ].map(({label,Icon,cells,levels})=><tr key={label}><th scope="row"><Icon size={19}/>{label}</th>{cells.map((cell,i)=><td key={i} className={i===0?s.highlight:undefined}><span tabIndex={0} className={levels[i]===1?s.matrixCheck:levels[i]===2?s.matrixPartial:s.matrixUnknown} aria-label={`${label}: ${cell}`} title={cell}>{levels[i]===1?<Check size={20}/>:levels[i]===2?"⊙":"—"}<span className={s.matrixTooltip}>{cell}</span></span></td>)}</tr>)}</tbody></table>
      </div>

      <details className={s.moreFeatures}><summary>+ Explore more of the suite</summary><div><Link href="/features/blue">Inventory restocking <ArrowRight size={16} /></Link><Link href="/features/black">Resource library <ArrowRight size={16} /></Link><Link href="/features/red">APEX Red <ArrowRight size={16} /></Link><Link href="/pricing">Compare plan limits <ArrowRight size={16} /></Link></div></details>
      <p className={s.tableNote}>✓ Documented feature · ⊙ Related or narrower capability · — Not verified in reviewed sources (not a claim of absence). Hover or focus a symbol for details. Sources checked September 7, 2026: <a href="https://selleramp.com/features/">SellerAmp</a> · <a href="https://www.threecolts.com/seller-365/inventorylab">InventoryLab</a> · <a href="https://sellerboard.com/">sellerboard</a>. Availability and limits vary by plan.</p>
      <div className={s.costBar}><div><small>YOUR STARTING POINT</small><strong>One subscription.</strong><span>Tools for your wholesale workflow</span></div><div><small>STARTER PLAN</small><strong>$149.99<span>/month</span></strong><span>5 users · Monthly billing</span></div><div><strong>Try the suite for 7 days</strong><Link href={signup}>Start free trial <ArrowRight size={20} /></Link></div></div>
      <p className={s.tableNote}>Features shown are part of the APEX suite. Usage limits and team access vary by plan. <Link href="/pricing">View the full plan comparison.</Link></p>
    </section>

    <section className={s.pricing} id="landing-plans" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading">Start with a free trial.<br />Choose your next chapter.</h2><p>Choose the plan built for where your business is going.</p>
      <div className={s.planGrid}>
        <article className={s.starter}><span className={s.recommended}><Star size={17} fill="currentColor" /> A place to start</span><h3>Starter</h3><p>For growing wholesale businesses</p><div className={s.price}>$149.99<small>/mo</small></div><div className={s.planTerms}>7-day free trial · Billed monthly · Cancel anytime</div><ul>{["3 free authorized wholesale suppliers on trial", "Sourcing, vendors, and purchase orders", "Analytics and review tools", "5 authorized users + email support"].map(x=><li key={x}><Check size={19}/>{x}</li>)}</ul><Link href={signup}>Start free trial <ArrowRight size={20}/></Link></article>
        <article className={s.pro}><h3>Pro</h3><p>For teams ready to scale</p><div className={s.price}>$299<small>/mo</small></div><div className={s.planTerms}>7-day free trial · Billed monthly · Cancel anytime</div><ul>{["Everything in Starter", "Higher usage limits across the suite", "10 authorized users + priority onboarding"].map(x=><li key={x}><Check size={19}/>{x}</li>)}</ul><Link href="/auth?mode=signup&plan=pro&period=monthly">Choose Pro <ArrowRight size={20}/></Link></article>
      </div><Link className={s.allPlans} href="/pricing">See all features and annual pricing <ArrowRight size={18}/></Link>
      <p className={s.annualNote}>Go annual and save 20%, plus unlock the <Link href="/distributor-vault">Distributor Vault</Link> — 390+ vetted wholesale distributors, member-exclusive.</p>
    </section>

    <SiteFooter />
    {showBar && <aside className={s.floatingCta} aria-label="Start an APEX trial"><div><strong>7 days</strong><span>free trial</span></div><div><span>then from</span><b>$149.99/mo</b></div><Link href={signup}>Start free trial <ArrowRight size={20}/></Link></aside>}
  </>;
}
