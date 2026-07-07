import { ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, LucideIcon } from "lucide-react";

interface FeatureSectionProps {
  id: string;
  number: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  /** Full Tailwind text-color class for this page's brand accent, e.g. "text-blue-600" */
  accentText: string;
  /** Full Tailwind bg-color class for the icon badge, e.g. "bg-blue-600" */
  accentBg: string;
  image: { url: string; alt: string };
  imageSide: "left" | "right";
  cta: ReactNode;
}

export default function FeatureSection({
  id,
  number,
  eyebrow,
  icon: Icon,
  title,
  description,
  bullets,
  accentText,
  accentBg,
  image,
  imageSide,
  cta,
}: FeatureSectionProps) {
  const imageFirst = imageSide === "left";

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center scroll-mt-28"
    >
      <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center shrink-0`}>
            <Icon size={18} className="text-white" strokeWidth={1.75} />
          </div>
          <div className={`text-xs font-black uppercase tracking-[0.2em] ${accentText}`}>
            {number} — {eyebrow}
          </div>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">{description}</p>
        {bullets && (
          <div className="space-y-4 mb-8">
            {bullets.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 size={20} className={`${accentText} shrink-0 mt-0.5`} />
                <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        )}
        {cta}
      </div>
      <div
        data-feature-image
        className={`rounded-[32px] overflow-hidden border border-slate-200 shadow-sm bg-white ${
          imageFirst ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <img src={image.url} alt={image.alt} className="w-full h-auto block" />
      </div>
    </motion.section>
  );
}
