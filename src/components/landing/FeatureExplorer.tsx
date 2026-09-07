"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Search, Users, Package, BarChart3, GraduationCap, ArrowRight, Check } from "lucide-react";
import { usePageMotion } from "./Motion";
import styles from "./landing.module.css";

import catalog from "../../assets/master-catalog.png.asset.json";
import suppliers from "../../assets/vendors-dashboard.png.asset.json";
import orders from "../../assets/purchase-orders.png.asset.json";
import analytics from "../../assets/profit-loss-dashboard.png.asset.json";
import learning from "../../assets/apex-university.png.asset.json";

const screens = [catalog, suppliers, orders, analytics, learning];

const features = [
  { id: "sourcing", label: "Sourcing", icon: Search, title: "Find your next best-selling product.", description: "Turn supplier catalogs into a clearer sourcing workflow with the master catalog and UPC scanner.", bullets: ["Organize your product catalog", "Scan UPCs in one place", "Keep sourcing connected"], href: "/features/green", preview: "Master catalog" },
  { id: "suppliers", label: "Suppliers", icon: Users, title: "Keep every supplier in the picture.", description: "Give your vendor relationships a home, with the information your team needs to move the next order forward.", bullets: ["Organize vendor details", "Bring supplier information together", "Connect vendors to purchasing"], href: "/features/blue", preview: "Supplier workspace" },
  { id: "orders", label: "Orders", icon: Package, title: "From sourcing to your next shipment.", description: "Build purchase orders and keep your purchasing workflow organized as your wholesale business grows.", bullets: ["Create purchase orders", "Track purchasing details", "Review order discrepancies"], href: "/features/blue", preview: "Purchase order workflow" },
  { id: "analytics", label: "Analytics", icon: BarChart3, title: "See the business behind the sales.", description: "Bring your profitability, operating expenses, and restocking decisions into a clearer view.", bullets: ["Review profit and loss", "Track operating expenses", "Plan inventory restocks"], href: "/features/blue", preview: "Business overview" },
  { id: "learning", label: "Learning", icon: GraduationCap, title: "Build your skills as you build your business.", description: "Keep learning with APEX University and a resource library made for the Amazon wholesale journey.", bullets: ["Explore wholesale lessons", "Access business resources", "Put your learning to work"], href: "/features/black", preview: "Learning workspace" },
];

export default function FeatureExplorer() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const feature = features[active];
  const { paused } = usePageMotion();
  const [interacting,setInteracting] = useState(false);
  const [desktop,setDesktop] = useState(false);
  useEffect(()=>{const m=matchMedia('(min-width: 701px)');const update=()=>setDesktop(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[]);
  useEffect(()=>{if(paused||interacting||!desktop)return;const timer=setInterval(()=>{if(!document.hidden)setActive(i=>(i+1)%features.length)},9500);return()=>clearInterval(timer)},[paused,interacting,desktop,active]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % features.length;
    else if (event.key === "ArrowLeft") next = (index + features.length - 1) % features.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = features.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section id="landing-features" className={styles.features} aria-label="Explore APEX features" onMouseEnter={()=>setInteracting(true)} onMouseLeave={()=>setInteracting(false)} onFocusCapture={()=>setInteracting(true)} onBlurCapture={(e)=>{if(!e.currentTarget.contains(e.relatedTarget))setInteracting(false)}}>
      <div className={styles.tabs} role="tablist" aria-label="APEX tools">
        {features.map((item, index) => {
          const Icon = item.icon;
          return <button key={item.id} ref={(el) => { buttons.current[index] = el; }} role="tab" id={`tab-${item.id}`} aria-selected={index === active} aria-controls="feature-panel" tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => navigate(event, index)}><Icon size={21} aria-hidden="true" />{item.label}</button>;
        })}
      </div>
      <div key={feature.id} id="feature-panel" role="tabpanel" aria-labelledby={`tab-${feature.id}`} tabIndex={0} className={styles.featurePanel} data-running={!paused&&!interacting&&desktop}>
        <div className={styles.panelProgress} />
        <div className={styles.featureCopy}>
          <h2>{feature.title}</h2>
          <div className={styles.signals} aria-label="Feature workflow overview"><div><Search size={13}/><b>{feature.label} workspace</b><small>APEX SUITE</small></div><article><strong>{feature.label}</strong><small>Connected workflow</small><i/></article><aside><b>Organized</b><small>In one place</small></aside><aside><b>Next step</b><small>Keep moving</small></aside></div>
          <ul>{feature.bullets.map((bullet) => <li key={bullet}><span><Check size={15} strokeWidth={3} aria-hidden="true" /></span>{bullet}</li>)}</ul>
          <Link href={feature.href}>Explore {feature.label.toLowerCase()} <ArrowRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className={styles.previewWrap}>
          <p className={styles.previewLabel}>APEX · {feature.preview}</p>
          <div className={styles.preview}>
            <div className={styles.productScreen}>
              <img src={screens[active].url} alt={`${feature.preview} in APEX`} width={1680} height={782} />
              <span className={styles.demoCursor} aria-hidden="true">➤</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
