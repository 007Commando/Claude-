"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./landing.module.css";

const MotionContext = createContext({ paused:true, toggle:()=>{} });
export function MotionPage({children}:{children:ReactNode}) {
  const [reduced,setReduced]=useState(true);
  const [manual,setManual]=useState(false);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
  const paused=reduced||manual;
  return <MotionContext.Provider value={{paused,toggle:()=>setManual(x=>!x)}}><div className={styles.page} data-motion={paused?'paused':'playing'}>{children}</div></MotionContext.Provider>;
}
export function MotionToggle(){const {paused,toggle}=useContext(MotionContext);return <button className={styles.motionToggle} onClick={toggle} aria-label={paused?'Play page animations':'Pause page animations'} title={paused?'Play animations':'Pause animations'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}
export function usePageMotion(){return useContext(MotionContext)}
export function HeroTitle(){const {paused}=usePageMotion();const [index,setIndex]=useState(0);const words=['Product Sourcing','Supplier Management','Profit Analytics','APEX University'];useEffect(()=>{if(paused)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%words.length)},2800);return()=>clearInterval(timer)},[paused]);return <h1 id="landing-title" aria-label="Grow your Amazon business with APEX: sourcing, suppliers, analytics, and learning."><span>Grow your Amazon</span><span>business with</span><span className={styles.rotator} aria-hidden="true"><span key={index}>{words[index]}</span></span></h1>}
export function HeroOrb(){return <div className={styles.orbWrap} aria-hidden="true"><div className={styles.orb}><i/><i/></div></div>}
export function Reveal({children}:{children:ReactNode}){const ref=useRef<HTMLDivElement>(null);const [visible,setVisible]=useState(false);useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect()}},{threshold:.08});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect()},[]);return <div ref={ref} className={styles.reveal} data-visible={visible}>{children}</div>}
