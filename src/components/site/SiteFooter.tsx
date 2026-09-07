import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "../landing/full-layout.module.css";
export default function SiteFooter(){return (
    <footer className={s.footer}>
      <div className={s.footerGrid}><div className={s.footerIntro}><Link href="/" className={s.wordmark}>APEX</Link><p>One connected workspace for Amazon wholesale—sourcing, suppliers, purchasing, analytics, and learning.</p><Link href="/contact-us">Contact the APEX team <ArrowRight size={16}/></Link><img className={s.partnerBadge} src="/images/landing/amazon-software-partner.png" alt="Amazon Software Partner" width={699} height={247} loading="lazy"/><small>APEX © {new Date().getFullYear()}</small></div>
        {[{title:"Product",links:[["Features","/#landing-features"],["How it works","/how-it-works"],["Pricing","/pricing"],["Logistics","/features/red"],["Review Booster","/review-booster"]]},{title:"Company",links:[["Contact","/contact-us"],["Rewards & benefits","/rewards-benefits"],["Sign in","/auth"]]},{title:"Resources",links:[["APEX University","/features/black"],["Blog","/blog"],["Distributor vault","/distributor-vault"],["Prep center network","/prep-center-network"],["Ungating guide","/ungating-guide"],["Starter bundle","/fba-starter-bundle"]]},{title:"Legal",links:[["Privacy policy","/privacy"],["Terms of service","/terms"]]}].map(group=><nav key={group.title} aria-label={group.title}><h3>{group.title}</h3>{group.links.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</nav>)}
      </div><div className={s.dotWordmark} aria-hidden="true">apex</div>
    </footer>
)}
