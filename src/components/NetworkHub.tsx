import { motion } from "motion/react";
import {
  Command,
  Globe,
  ScanLine,
  Database,
  Boxes,
  Library,
  FileText,
  BarChart3,
  LayoutDashboard,
  Star,
  LucideIcon,
} from "lucide-react";

type Brand = "blue" | "green" | "black";

interface HubNode {
  title: string;
  desc: string;
  icon: LucideIcon;
  brand: Brand;
}

const brandStyles: Record<Brand, { dot: string; iconBg: string; icon: string; label: string }> = {
  blue: { dot: "bg-blue-500", iconBg: "bg-blue-50", icon: "text-blue-600", label: "Apex Blue" },
  green: { dot: "bg-emerald-500", iconBg: "bg-emerald-50", icon: "text-emerald-600", label: "Apex Green" },
  black: { dot: "bg-slate-900", iconBg: "bg-slate-100", icon: "text-slate-900", label: "Apex Black" },
};

export default function NetworkHub() {
  const features: Record<string, HubNode> = {
    vendors:   { title: "Vendor Management", desc: "Vetted supplier directory",     icon: Globe,           brand: "blue" },
    upc:       { title: "UPC Scanner",       desc: "High-speed file vetting",       icon: ScanLine,        brand: "green" },
    database:  { title: "Central Database",  desc: "Unified product vault",         icon: Database,        brand: "blue" },
    inventory: { title: "Inventory",         desc: "Stock & restock signals",       icon: Boxes,           brand: "blue" },
    catalog:   { title: "Master Catalog",    desc: "Supplier price book",           icon: Library,         brand: "green" },
    po:        { title: "Purchase Orders",   desc: "Automated PO dispatch",         icon: FileText,        brand: "blue" },
    analytics: { title: "Analytics Hub",     desc: "Real-time net margin",          icon: BarChart3,       brand: "blue" },
    dashboard: { title: "Operation Dashboard", desc: "Live sales console",          icon: LayoutDashboard, brand: "black" },
    review:    { title: "Review Booster",    desc: "Automated review engine",       icon: Star,            brand: "black" },
  };

  // viewBox 1000 x 500. Hub center (500, 90)
  // Left branch: Vendors (140, 240) -> children UPC (40,380), Inventory (240,380); UPC -> Database (40, 460 small? ) — keep simple
  // Restructure: Hub center top. Two side columns + center.
  // Layout:
  // Row 1 (y=40-130): Hub center (440-560 x, 40-130)
  // Row 2 (y=210-290):
  //   Left: Vendors (60-260)
  //   Center: Review Booster (400-600)
  //   Right: Purchase Orders (740-940)
  // Row 3 (y=360-440):
  //   Under Vendors: UPC (20-200), Inventory (220-400 — overlaps center?)
  //   Better: Vendors children below VM stacked horizontally narrow: UPC (20-180), Inventory (200-360), Catalog (... )
  //   PO children: Analytics (620-780), Dashboard (800-960)
  // Catalog under vendors won't fit. Let's place Catalog at row 4.
  //
  // Simpler: keep 3 columns. Left col cards stacked: Vendors -> (UPC, Inventory, Catalog) vertical, with Database to right of UPC.
  // Stick close to "old framework": hub on top, all features in a clean grid connected by lines.

  // Final layout (viewBox 1000 x 560):
  // Hub: 420,30 200x80
  // y=180 row:
  //   Vendors: 40,180 200x70
  //   Review:  400,180 200x70
  //   PO:      760,180 200x70
  // y=310 row (children of Vendors & PO):
  //   UPC:       40,310 180x65
  //   Database:  240,310 180x65  (from UPC)
  //   Analytics: 620,310 160x65
  //   Dashboard: 800,310 160x65
  // y=420 row:
  //   Inventory: 40,420 180x65
  //   Catalog:   240,420 180x65

  const paths = [
    // Hub -> Vendors
    "M 500 110 C 500 150, 140 150, 140 180",
    // Hub -> Review
    "M 500 110 L 500 180",
    // Hub -> PO
    "M 500 110 C 500 150, 860 150, 860 180",
    // Vendors -> UPC
    "M 130 250 L 130 310",
    // Vendors -> Inventory
    "M 150 250 C 150 380, 130 380, 130 420",
    // Vendors -> Catalog (via right)
    "M 170 250 C 170 400, 330 400, 330 420",
    // UPC -> Database
    "M 220 342 L 240 342",
    // PO -> Analytics
    "M 840 250 C 840 280, 700 280, 700 310",
    // PO -> Dashboard
    "M 880 250 C 880 280, 880 280, 880 310",
  ];

  const Card = ({ node, compact = false }: { node: HubNode; compact?: boolean }) => {
    const Icon = node.icon;
    const s = brandStyles[node.brand];
    return (
      <div className={`bg-white border border-slate-200 rounded-xl ${compact ? "px-2.5 py-2" : "px-3 py-2.5"} shadow-sm hover:shadow-md transition-shadow flex items-center gap-2.5 w-full h-full`}>
        <div className={`relative w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`${s.icon} w-4 h-4`} strokeWidth={2} />
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${s.dot} ring-2 ring-white`} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] font-semibold text-slate-900 leading-tight truncate">{node.title}</h4>
          <p className="text-[10px] text-slate-500 leading-snug truncate mt-0.5">{node.desc}</p>
        </div>
      </div>
    );
  };

  const mobileOrder = [features.vendors, features.upc, features.database, features.inventory, features.catalog, features.po, features.analytics, features.dashboard, features.review];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Unified Data Pipeline
          </div>
          <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-4 tracking-tight">
            One connected workflow network.
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Every tool flows through the Apex Hub. Feature icons show the job, color shows the suite.
          </p>
          <div className="mt-6 flex items-center justify-center gap-5 text-[11px] font-medium text-slate-600">
            {(["blue", "green", "black"] as Brand[]).map((b) => (
              <div key={b} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${brandStyles[b].dot}`} />
                <span>{brandStyles[b].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
            <div className="relative w-full" style={{ aspectRatio: "1000 / 560" }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 560" fill="none" preserveAspectRatio="xMidYMid meet">
                {paths.map((d, i) => (
                  <path key={`b-${i}`} d={d} stroke="#cbd5e1" strokeWidth={1.25} fill="none" strokeLinecap="round" />
                ))}
                {paths.map((d, i) => (
                  <motion.path
                    key={`p-${i}`}
                    d={d}
                    stroke="#0f172a"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="3 100"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: [0, -206] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: i * 0.25 }}
                    opacity={0.45}
                  />
                ))}

                {/* Hub */}
                <foreignObject x={420} y={30} width={160} height={80}>
                  <div className="relative w-full h-full rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-lg ring-1 ring-white/10">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1">
                      <Command className="text-white w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-semibold tracking-tight">Apex Hub</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Active Command</span>
                  </div>
                </foreignObject>

                <foreignObject x={40} y={180} width={200} height={70}><Card node={features.vendors} /></foreignObject>
                <foreignObject x={400} y={180} width={200} height={70}><Card node={features.review} /></foreignObject>
                <foreignObject x={760} y={180} width={200} height={70}><Card node={features.po} /></foreignObject>

                <foreignObject x={40} y={310} width={180} height={65}><Card node={features.upc} compact /></foreignObject>
                <foreignObject x={240} y={310} width={180} height={65}><Card node={features.database} compact /></foreignObject>
                <foreignObject x={620} y={310} width={160} height={65}><Card node={features.analytics} compact /></foreignObject>
                <foreignObject x={800} y={310} width={160} height={65}><Card node={features.dashboard} compact /></foreignObject>

                <foreignObject x={40} y={420} width={180} height={65}><Card node={features.inventory} compact /></foreignObject>
                <foreignObject x={240} y={420} width={180} height={65}><Card node={features.catalog} compact /></foreignObject>
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden relative">
          <div className="absolute left-7 top-6 bottom-6 w-px bg-slate-200" />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <Command className="text-white w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Apex Hub</div>
                <div className="text-[11px] text-slate-500">Active Command</div>
              </div>
            </div>
            {mobileOrder.map((item, i) => {
              const Icon = item.icon;
              const s = brandStyles[item.brand];
              return (
                <div key={i} className="flex gap-4 items-center">
                  <div className={`relative w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Icon className={`${s.icon} w-6 h-6`} strokeWidth={2} />
                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${s.dot} ring-2 ring-white`} />
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-[12px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
