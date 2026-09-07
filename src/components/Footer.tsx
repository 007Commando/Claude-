"use client";
import {usePathname} from "next/navigation";
import SiteFooter from "./site/SiteFooter";
export default function Footer(){return usePathname()==="/"?null:<SiteFooter/>}
