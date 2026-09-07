"use client";
import {useState,useEffect} from "react";
import {GraduationCap,Check,Play} from "lucide-react";
import {usePageMotion} from "./Motion";
import s from "./full-layout.module.css";
const lessons=["Wholesale foundations","Product sourcing","Supplier relationships","Business operations"];
export default function PhoneLessons(){const [active,setActive]=useState(0);const {paused}=usePageMotion();useEffect(()=>{if(paused)return;const timer=setInterval(()=>{if(!document.hidden)setActive(n=>(n+1)%lessons.length)},6000);return()=>clearInterval(timer)},[active,paused]);return <>
<div className={s.courseArt}><div className={s.lessonOrbit} aria-hidden="true"><GraduationCap size={58}/><i/><i/><i/></div><span>THE WHOLESALE<br/><strong>BLUEPRINT</strong></span></div>
<div className={s.lessonNow}><span>LESSON PREVIEW</span><b>0{active+1} / 04</b></div><h3 className={s.lessonTitle} key={active}>{lessons[active]}</h3><p>Build a stronger foundation, one next step at a time.</p>
<div className={s.lessonProgress} aria-hidden="true"><i key={active}/></div>
<div className={s.lessonChoices}>{lessons.map((lesson,i)=><button key={lesson} onClick={()=>setActive(i)} aria-pressed={active===i} className={s.lessonChoice}><span>{i<active?<Check size={12}/>:String(i+1).padStart(2,'0')}</span><b>{lesson}</b>{i===active?<Play size={13} fill="currentColor"/>:i<active?<Check size={14}/>:null}</button>)}</div>
</>}
