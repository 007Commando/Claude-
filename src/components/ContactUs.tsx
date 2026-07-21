"use client";

import Script from "next/script";
import { motion } from "motion/react";
import { Mail } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Mail size={14} />
            Contact Us
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Get in <span className="text-brand">Touch</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Questions about Apex, your account, or partnering with us? Send us a message and
            we'll get back to you.
          </p>
        </motion.section>

        {/* Embedded form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-4 sm:p-6"
        >
          <div style={{ height: "737px" }}>
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/mMgi91yvoJAo2fHkXSlI"
              style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }}
              id="inline-mMgi91yvoJAo2fHkXSlI"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Apex Applications"
              data-height="737"
              data-layout-iframe-id="inline-mMgi91yvoJAo2fHkXSlI"
              data-form-id="mMgi91yvoJAo2fHkXSlI"
              title="Apex Applications"
            />
          </div>
        </motion.div>
      </div>

      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
