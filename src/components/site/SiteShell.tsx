"use client";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { MotionPage,usePageMotion } from "../landing/Motion";
import type { ReactNode } from "react";
function Interior({children}:{children:ReactNode}){const path=usePathname();const {paused}=usePageMotion();const kind=path.startsWith('/features/')?'feature':path.startsWith('/blog/')?'article':['/terms','/privacy'].includes(path)?'legal':path==='/auth'?'auth':path==='/dashboard'?'dashboard':path==='/pricing'?'pricing':['/apex-elite','/premium-membership','/fba-starter-bundle'].includes(path)?'offer':'resource';return <MotionConfig reducedMotion={paused?'always':'user'}><div className="siteInterior" data-kind={kind} data-route={path}>{children}</div></MotionConfig>}
const FULL_BLEED=['/','/original','/start','/start-b','/virtual-assistants'];
export default function SiteShell({children}:{children:ReactNode}){const path=usePathname();return FULL_BLEED.includes(path)?<>{children}</>:<MotionPage><Interior key={path}>{children}</Interior></MotionPage>}
