"use client";
import {usePathname} from "next/navigation";
import SiteNavigation from "./site/SiteNavigation";
export default function Navigation(){return usePathname()==="/"?null:<SiteNavigation/>}
