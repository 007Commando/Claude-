"use client";

import { useRef, useState } from "react";
import { Play, X } from "lucide-react";
import styles from "./landing.module.css";

export default function LandingDemo() {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);

  function close() { dialog.current?.close(); }

  return (
    <>
      <button ref={trigger} className={styles.secondary} onClick={() => dialog.current?.showModal()}>
        <Play size={18} fill="currentColor" aria-hidden="true" /> Watch demo
      </button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="demo-title"
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        onClose={() => { video.current?.pause(); trigger.current?.focus(); }}>
        <div className={styles.dialogHeader}>
          <h2 id="demo-title">A closer look at APEX</h2>
          <button autoFocus onClick={close} aria-label="Close demo"><X size={24} /></button>
        </div>
        <video ref={video} controls playsInline preload="none" onError={() => setFailed(true)}>
          <source src="/videos/dashboard-hero-demo.mp4" type="video/mp4" />
          Your browser does not support embedded video.
        </video>
        <p>{failed ? <>The video could not load. <a href="/videos/dashboard-hero-demo.mp4">Open the demo video</a>.</> : "APEX dashboard walkthrough · Use the player controls to play or pause."}</p>
      </dialog>
    </>
  );
}
