import { useState, useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BarChart3, 
  Search, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  ShoppingBag,
  Layers,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import sourcingSpeedVideo from "../assets/sourcing-speed.mp4.asset.json";
import SuiteMap from "./SuiteMap";


const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};


function SalesCounter() {
  const [count, setCount] = useState(23469);
  
  useEffect(() => {
    let startTime: number;
    let duration = 3000; // 3 seconds to go from min to max
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) % (duration * 2);
      
      const normalizedProgress = progress < duration 
        ? progress / duration 
        : 1 - (progress - duration) / duration;
        
      const current = Math.floor(23469 + (148762 - 23469) * normalizedProgress);
      setCount(current);
      requestAnimationFrame(animate);
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <span>${count.toLocaleString()}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
                const paths: Record<string, string> = { blue: "/features/blue", green: "/features/green", black: "/features/black" };
                return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-16 items-center">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="max-w-2xl"
            >
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-10 tracking-tight">
                Build Your Amazon Wholesale Business. <br/>
                <span className="text-slate-300 italic">Scale It With Confidence.</span>
              </h1>
              <p className="text-2xl text-slate-500 mb-12 leading-relaxed font-medium">
                Everything you need to source products, manage suppliers, build purchase orders, and grow your Amazon business from your first sale to your next million.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <button 
                  onClick={() => navigate("/pricing")}
                  className="bg-brand text-white px-10 py-5 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  Run It <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById("features-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-slate-50 text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl text-sm font-black hover:bg-white hover:shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  Learn More
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-24 lg:mt-0 perspective-1000"
            >
              <div className="relative bg-white rounded-[40px] p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden">
                <video
                  src="/videos/dashboard-hero-demo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto rounded-[34px]"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/20 blur-[80px] rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sourcing: Speed is Precision */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full mb-6 uppercase tracking-wider">
                <Search size={14} />
                Sourcing USP: The Intelligent Filter Engine
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 mb-6">Sourcing: Speed is Precision</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Wholesale is a race for stock. Our intelligence engine predicts Amazon rank fluctuations and competitor replenishment cycles, ensuring the leads you buy today don't become dead inventory tomorrow.
              </p>
              <ul className="space-y-4">
                {[
                  "Process millions of supplier data points in seconds",
                  "Predictive BSR analysis to anticipate demand shifts",
                  "Auto-filtering of suppressed buy-box or IP-claim brands",
                  "Integrated 'Price-Match' checking against competitors"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <CheckCircle2 className="text-brand w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-slate-800 font-bold block text-sm mb-0.5">{item.split(':')[0]}</span>
                      <span className="text-slate-600 text-sm">Automated logic that keeps your capital safe.</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <div>
              <div className="relative bg-white rounded-[40px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden">
                <video
                  src={sourcingSpeedVideo.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto rounded-[34px] border border-slate-100 scale-[1.02] hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-500/15 blur-[60px] rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand/15 blur-[60px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Apex Ecosystem Map */}
      <SuiteMap />



      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-bold text-brand uppercase tracking-wider mb-3">Core Pillars</h2>
            <p className="text-4xl font-extrabold text-slate-900 mb-6">Built to solve the wholesale bottleneck.</p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We replace fragmented spreadsheets and legacy tool-chains with a single, high-speed OS designed specifically for the unique demands of Amazon wholesale.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Live Profit & Loss",
                desc: "Financial clarity is your primary competitive advantage. Know exactly which SKUs are driving growth and which are draining capital in real-time.",
                icon: <BarChart3 className="w-6 h-6" />,
                color: "bg-blue-500",
                usp: "Live-Sync Advantage",
                view: 'blue'
              },
              {
                title: "High-Speed Sourcing",
                desc: "Turn weeks of manual catalog scanning into minutes of automated profit discovery. Scale your sourcing without increasing your headcount.",
                icon: <Search className="w-6 h-6" />,
                color: "bg-purple-500",
                usp: "Intelligent Filter Engine",
                view: 'green'
              },
              {
                title: "Precision POs",
                desc: "Professionalize your relationship with suppliers. Build accurate, error-free orders that translate directly from your sourcing leads.",
                icon: <FileText className="w-6 h-6" />,
                color: "bg-emerald-500",
                usp: "Sourcing-to-PO Workflow",
                view: 'blue'
              }
            ].map((feature, i) => (
                <motion.div 
                  key={i}
                  variants={fadeIn}
                  onClick={() => navigate(paths[feature.view])}
                  className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
                >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 ${feature.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-${feature.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{feature.usp}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">{feature.desc}</p>
                <div className="h-1 w-12 bg-slate-200 rounded-full group-hover:bg-brand group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solutions / Deep Dive Section */}
      <section id="solutions" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* P&L Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 relative group overflow-hidden">
                {/* Gross Sales Counter */}
                <div className="absolute top-8 left-8 z-10">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Sales</div>
                  <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                    <SalesCounter />
                  </div>
                </div>

                <div className="h-64 flex items-end gap-2 px-2 mt-12 relative z-0">
                  {[35, 55, 42, 30, 38, 50, 52, 85, 65, 95, 78, 62, 30].map((h, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        height: [
                          `${h}%`, 
                          `${Math.min(100, h + 15)}%`, 
                          `${Math.max(10, h - 10)}%`, 
                          `${h}%`
                        ] 
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.1
                      }}
                      className="flex-1 rounded-sm bg-orange-500 hover:brightness-110 transition-all cursor-crosshair"
                    />
                  ))}
                </div>
                
                {/* Background Grid Lines */}
                <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between opacity-[0.03]">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="w-full h-px bg-slate-900" />
                  ))}
                </div>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full mb-6 uppercase tracking-widest">
                <BarChart3 size={14} className="stroke-[3]" />
                Financial Clarity Engine
              </div>
              <h3 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">Clarity over <span className="text-slate-300 italic">Guesswork.</span></h3>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                Most sellers fly blind with delayed data. Apex syncs directly with Amazon to provide a crystal-clear, real-time map of your net profit, accounting for every hidden fee automatically.
              </p>
              <div className="space-y-6">
                {[
                  { title: "True Net Margin Logic", desc: "Automated landed cost calculation per unit." },
                  { title: "Real-time Fee Scraping", desc: "Instantly adjust for storage and shipping changes." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                      {i === 0 ? <Calculator size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                      <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{item.title}</h5>
                      <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Promo Section */}
      <section className="py-24 bg-slate-50 border-t border-b border-slate-100 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 p-32 opacity-[0.03] pointer-events-none select-none">
          <GraduationCap size={360} className="text-brand" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-[40px] p-10 lg:p-16 border border-slate-200/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand/10 text-brand text-[10px] font-black rounded-full mb-6 uppercase tracking-widest">
                <GraduationCap size={14} className="stroke-[3]" />
                Apex Sourcing Academy
              </div>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
                New to Amazon? <br />
                <span className="text-slate-300 italic">Learn for Free.</span>
              </h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Learn for Free how to start selling with our included Course. Walk through account creation, supplier discovery, catalog vetting, and launch with precision.
              </p>
            </div>
            <div className="shrink-0 w-full lg:w-auto">
              <button className="w-full lg:w-auto bg-brand hover:bg-brand-dark text-white px-10 py-5 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)] flex items-center justify-center gap-3 uppercase tracking-widest">
                Enroll In Free Course <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 opacity-10">
          <Layers size={400} className="text-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to scale your Amazon business?</h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10 font-medium">
            Join hundreds of wholesale experts using Apex to automate their sourcing, save hours on POs, and maximize profit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/pricing")}
              className="bg-white text-brand px-10 py-5 rounded-2xl text-xl font-black hover:scale-105 transition-all shadow-2xl"
            >
              Start Your 14-Day Free Trial
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
