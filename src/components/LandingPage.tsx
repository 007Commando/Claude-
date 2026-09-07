import Link from "next/link";
import { ArrowRight, PackageCheck, Menu, UserRound } from "lucide-react";
import EcosystemPillars from "./landing/EcosystemPillars";
import FeatureExplorer from "./landing/FeatureExplorer";
import LandingDemo from "./landing/LandingDemo";
import { MotionPage, MotionToggle, HeroTitle } from "./landing/Motion";
import SiteNavigation from "./site/SiteNavigation";
import Drone from "./landing/Drone";
import FullLayout from "./landing/FullLayout";
import styles from "./landing/landing.module.css";

const signup = "/auth?mode=signup&plan=starter&period=monthly";

export default function LandingPage() {
  return (
    <MotionPage>
      <a className={styles.skipLink} href="#landing-features">Skip to features</a>
        <SiteNavigation />
      <section className={styles.hero} aria-labelledby="landing-title">
        <img className={styles.heroArt} src="/images/landing/warehouse-hero.png" alt="" fetchPriority="high" width="1536" height="1024" />

        <div className={styles.heroContent}>
          <div className={styles.badge}><PackageCheck size={20} aria-hidden="true" /><span>Built for Amazon wholesale sellers</span></div>
          <HeroTitle />
          <p>Source products, manage suppliers, and see your profits.<br className={styles.desktopBreak} /> One connected workspace for your Amazon business.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={signup}>Start free trial <ArrowRight size={19} aria-hidden="true" /></Link>
            <LandingDemo />
          </div>
          <p className={styles.trialNote}>7 days free · Then from $149.99/month</p>

        </div>
        <Drone />
      </section>

      <EcosystemPillars />

      <FeatureExplorer />

      <FullLayout />
    </MotionPage>
  );
}
