"use client";
import { useState } from "react";
import { usePageMotion } from "./Motion";
import s from "./drone.module.css";
export default function Drone(){
 const [run,setRun]=useState(0); const {paused}=usePageMotion();
 return <div className={s.scene}>
  <div className={s.dock}><span>SUPPLIER</span><i/><i/><i/></div>
  <div className={`${s.dock} ${s.destination}`}><span>FULFILLMENT</span><i/><i/></div>
  <button className={s.launch} onClick={()=>setRun(n=>n+1)} disabled={paused} aria-label="Replay drone box delivery">↗ Send a box</button>
  <div key={run} className={s.deliveryLoop}><div className={s.parcel} aria-hidden="true"><i/><b>▥</b></div><div className={s.flight} aria-hidden="true"><div className={s.drone}><i className={s.arm}/><i className={s.arm}/><b className={s.rotor}/><b className={s.rotor}/><div className={s.body}>A<span/></div><div className={s.gear}/></div></div></div>
 </div>
}
