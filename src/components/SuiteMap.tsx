import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutGrid,
  Star,
  School,
  BookOpen,
  BarChart,
  Globe,
  Database,
  FileText,
  CreditCard,
  Layers,
  Barcode,
  Shield,
  Package,
  Truck,
  Warehouse,
  Boxes,
  MessageSquare,
  Receipt,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import bullBlack from "../assets/bull-black.png.asset.json";
import bullBlue from "../assets/bull-blue.png.asset.json";
import bullGreen from "../assets/bull-green.png.asset.json";
import bullRed from "../assets/bull-red.png.asset.json";

type Suite = {
  key: "core" | "blue" | "green" | "red";
  number: string;
  label: string;
  labelAccent: string;
  kicker: string;
  bull: string;
  route: string;
  accent: string;
  ring: string;
  iconText: string;
  items: { icon: LucideIcon; title: string; desc: string }[];
};

const suites: Suite[] = [
  {
    key: "core",
    number: "01",
    label: "APEX",
    labelAccent: "CORE",
    kicker: "The command center",
    bull: bullBlack.url,
    route: "/features/black",
    accent: "text-slate-900",
    ring: "group-hover:ring-slate-900/15",
    iconText: "text-slate-800",
    items: [
      { icon: LayoutGrid, title: "Dashboard", desc: "Your Omnicspective Amazon Dashboard" },
      { icon: Star, title: "Review Booster", desc: "Automate Your Order Reviews & Boost Seller Feedback" },
      { icon: School, title: "Apex University", desc: "The Wholesale Blueprint Learning Center" },
      { icon: BookOpen, title: "Books & Resources", desc: "Recommended Reading & Resources" },
    ],
  },
  {
    key: "blue",
    number: "02",
    label: "APEX",
    labelAccent: "BLUE",
    kicker: "Operational dominance",
    bull: bullBlue.url,
    route: "/features/blue",
    accent: "text-blue-600",
    ring: "group-hover:ring-blue-500/20",
    iconText: "text-blue-600",
    items: [
      { icon: BarChart, title: "Analytics", desc: "Financial Analytics & Restock Management Dashboard" },
      { icon: Globe, title: "Vendors", desc: "Add & Organize Your Suppliers" },
      { icon: Database, title: "Databases", desc: "Market Intelligence For Your Listings" },
      { icon: FileText, title: "Purchase Orders", desc: "Create & Manage Your Purchasing" },
      { icon: CreditCard, title: "Opex", desc: "View & Manage Operating Expenses" },
    ],
  },
  {
    key: "green",
    number: "03",
    label: "APEX",
    labelAccent: "GREEN",
    kicker: "Hunting algorithms",
    bull: bullGreen.url,
    route: "/features/green",
    accent: "text-green-600",
    ring: "group-hover:ring-green-500/20",
    iconText: "text-green-600",
    items: [
      { icon: Layers, title: "Master Catalog", desc: "Merge and Manage Your Vendors Catalogs" },
      { icon: Barcode, title: "UPC Scanner", desc: "Find Matching Listings to a UPC List" },
      { icon: Shield, title: "Brands", desc: "View Brands in the Amazon Platform" },
      { icon: Package, title: "Products", desc: "Discover New Listings and Opportunities" },
    ],
  },
  {
    key: "red",
    number: "04",
    label: "APEX",
    labelAccent: "RED",
    kicker: "Workflow logistics",
    bull: bullRed.url,
    route: "/features/red",
    accent: "text-red-600",
    ring: "group-hover:ring-red-500/20",
    iconText: "text-red-600",
    items: [
      { icon: Truck, title: "Shipments", desc: "View or Create New Shipments" },
      { icon: Warehouse, title: "Warehouses", desc: "Manage Your Ship From Address & Connect To Multiple Prep Centers" },
      { icon: Boxes, title: "Inventory", desc: "Manage Your Warehouse Inventory" },
      { icon: MessageSquare, title: "Prep Chat", desc: "Live Chat With Your Prep Centers" },
      { icon: Receipt, title: "Prep Billing", desc: "View & Manage Your Prep Center Bills" },
    ],
  },
];

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeInItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function SuiteMap() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20 lg:mb-28">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            The Apex Ecosystem
          </div>
          <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-4 tracking-tight">
            Four suites. One operating system.
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Every tool built for Amazon wholesale, unified under a single command layer.
          </p>
        </div>

        <div className="relative">
          {/* Vertical thread connecting each suite as you scroll */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-200 to-transparent"
            aria-hidden
          />

          <div className="space-y-20 lg:space-y-28">
            {suites.map((s, i) => {
              const imageLeft = i % 2 === 0;
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative grid lg:grid-cols-2 gap-10 lg:gap-20 items-center"
                >
                  {/* Marker on the center thread */}
                  <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-[11px] font-black text-slate-400">
                    {s.number}
                  </div>

                  <div className={imageLeft ? "lg:order-1" : "lg:order-2"}>
                    <button
                      onClick={() => navigate(s.route)}
                      className={`group w-full flex flex-col items-center justify-center gap-5 bg-slate-50/70 border border-slate-100 rounded-[32px] py-16 px-8 ring-1 ring-transparent transition-all hover:bg-white hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)] ${s.ring}`}
                    >
                      <img src={s.bull} alt={`${s.label} ${s.labelAccent}`} className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
                      <div className="text-center">
                        <div className="text-lg font-black tracking-[0.15em] text-slate-900">
                          {s.label} <span className={s.accent}>{s.labelAccent}</span>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">{s.kicker}</div>
                      </div>
                    </button>
                  </div>

                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-80px" }}
                    className={imageLeft ? "lg:order-2" : "lg:order-1"}
                  >
                    <div className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${s.accent}`}>
                      {s.number} — {s.label} {s.labelAccent}
                    </div>
                    <div className="space-y-5 mb-8">
                      {s.items.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <motion.div key={idx} variants={fadeInItem} className="flex gap-3">
                            <div className="shrink-0 mt-0.5">
                              <Icon className={`w-5 h-5 ${s.iconText}`} strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 leading-tight">{item.title}</div>
                              <div className="text-xs text-slate-500 leading-snug mt-1">{item.desc}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => navigate(s.route)}
                      className={`inline-flex items-center gap-2 text-sm font-bold ${s.accent} hover:gap-3 transition-all`}
                    >
                      Explore {s.label} {s.labelAccent} <ArrowRight size={16} />
                    </button>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
