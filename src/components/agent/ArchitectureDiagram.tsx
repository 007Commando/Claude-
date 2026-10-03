"use client";

import { useState } from "react";

import apexBullLogo from "../../assets/apex-bull-logo.png.asset.json";
import { AMAZON_PATH, CLAUDE_PATH, CURSOR_PATH, GEMINI_PATH, OPENAI_PATH } from "./logos";

/**
 * The architecture in one picture: agents on top, the Apex layer in the middle,
 * the sources underneath. Static, with a slow dotted flow on the connectors.
 *
 * Solid means live. Dashed means planned. The captions are the same words the
 * rest of the page uses, so the diagram cannot promise more than the text does.
 */

type Tag = "live" | "beta" | "planned" | "client";

interface Item {
  id: string;
  title: string;
  tag: Tag;
  caption: string;
}

const ITEMS: Record<string, Item> = {
  claude: { id: "claude", title: "Claude", tag: "client", caption: "Apex's connector is built for Claude.ai, Claude Desktop and Claude Code. Add it with a key from Settings." },
  chatgpt: { id: "chatgpt", title: "ChatGPT", tag: "client", caption: "Apex speaks standard MCP over HTTP, so clients that support remote MCP servers can connect. Not individually tested yet." },
  gemini: { id: "gemini", title: "Gemini", tag: "client", caption: "Same standard endpoint. Any client that can call a remote MCP server with a bearer key can use it. Not individually tested yet." },
  cursor: { id: "cursor", title: "Cursor", tag: "client", caption: "Same standard endpoint, for coding agents and editors that support remote MCP. Not individually tested yet." },
  key: { id: "key", title: "Key check", tag: "live", caption: "Each key belongs to one account and one user, is stored hashed, shown once, and can be revoked. The account always comes from the key, never from the prompt." },
  perm: { id: "perm", title: "Permission check", tag: "live", caption: "Each tool runs the same subscription and permission rules as the page it mirrors, so an agent never sees more than the person who connected it." },
  read: { id: "read", title: "Read-only tools", tag: "live", caption: "Thirteen tools today, and none of them can change a price, an order or a setting." },
  approve: { id: "approve", title: "Approval gate", tag: "planned", caption: "Planned. When actions arrive, an agent will only propose a change and a signed-in person approves it first." },
  audit: { id: "audit", title: "Audit log", tag: "planned", caption: "Planned. Every agent call recorded with the key, the tool and the time, viewable in Settings." },
  amazon: { id: "amazon", title: "Your Amazon data", tag: "live", caption: "Apex syncs your own account's orders, inventory and fees every few minutes. Agents read that synced data, never Amazon directly." },
  catalog: { id: "catalog", title: "Catalog and scans", tag: "live", caption: "Your product database and supplier catalog scans, matched against Apex's catalog of 120M+ ASINs." },
  tools: { id: "tools", title: "Apex tools", tag: "live", caption: "Reading P&L, restock, repricer and scan results works today. Creating purchase orders or changing prices from an agent is planned, behind approval." },
};

const TAG_LABEL: Record<Tag, string> = { live: "Live", beta: "Beta", planned: "Planned", client: "MCP client" };
const TAG_STYLE: Record<Tag, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  beta: "bg-amber-50 text-amber-700 border-amber-200",
  planned: "bg-slate-100 text-slate-500 border-slate-200",
  client: "bg-blue-50 text-blue-700 border-blue-200",
};

const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#cbd5e1";
const BLUE = "#2563eb";

function Icon({ d, x, y, size = 26 }: { d: string; x: number; y: number; size?: number }) {
  return <path d={d} transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`} fill={INK} />;
}

export default function ArchitectureDiagram() {
  const [sel, setSel] = useState<string>("perm");
  const item = ITEMS[sel];

  const hover = (id: string) => ({
    onMouseEnter: () => setSel(id),
    onFocus: () => setSel(id),
    onClick: () => setSel(id),
    tabIndex: 0,
    style: { cursor: "pointer", outline: "none" } as React.CSSProperties,
  });

  const clients: [string, string, string][] = [
    ["claude", "Claude", CLAUDE_PATH],
    ["chatgpt", "ChatGPT", OPENAI_PATH],
    ["gemini", "Gemini", GEMINI_PATH],
    ["cursor", "Cursor", CURSOR_PATH],
  ];
  const chips: [string, string, boolean][] = [
    ["key", "Key", false],
    ["perm", "Permissions", false],
    ["read", "Read-only", false],
    ["approve", "Approval", true],
    ["audit", "Audit log", true],
  ];
  const sources: [string, string, string][] = [
    ["amazon", "Your Amazon data", "Orders, inventory, fees"],
    ["catalog", "Catalog and scans", "120M+ ASINs matched"],
    ["tools", "Apex tools", "P&L, restock, repricer"],
  ];

  return (
    <div>
      <style>{`
        .ai-flow{stroke-dasharray:2 6;animation:ai-flow 9s linear infinite}
        @keyframes ai-flow{to{stroke-dashoffset:-96}}
        @media (prefers-reduced-motion:reduce){.ai-flow{animation:none}}
        .ai-tile:hover rect.ai-bg,.ai-tile:focus rect.ai-bg{stroke:${BLUE};fill:#eff6ff}
      `}</style>
      <div className="-mx-2 overflow-x-auto px-2"><svg viewBox="0 0 560 548" className="w-full min-w-[520px]" role="img" aria-label="AI agents connect through the Apex layer, which checks the key and permissions, to your Amazon data, catalog and tools">
        {/* connectors: clients to Apex */}
        {clients.map(([id], i) => {
          const x = 16 + i * 140 + 54;
          return <path key={id} d={`M ${x} 100 C ${x} 130, ${x} 140, ${x} 170`} stroke={LINE} strokeWidth="1.5" fill="none" className="ai-flow" />;
        })}
        {/* connectors: Apex to sources */}
        {sources.map(([id], i) => {
          const x = 100 + i * 180;
          return <path key={id} d={`M ${x} 372 C ${x} 400, ${x} 410, ${x} 436`} stroke={LINE} strokeWidth="1.5" fill="none" className="ai-flow" />;
        })}

        {/* clients */}
        {clients.map(([id, label, d], i) => {
          const x = 16 + i * 140;
          return (
            <g key={id} className="ai-tile" {...hover(id)}>
              <rect className="ai-bg" x={x} y={22} width={108} height={78} rx={14} fill="#fff" stroke={LINE} strokeWidth={1.5} style={{ transition: "all .2s" }} />
              <Icon d={d} x={x + 54} y={52} size={26} />
              <text x={x + 54} y={86} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={INK}>{label}</text>
            </g>
          );
        })}

        {/* Apex layer */}
        <rect x={16} y={170} width={528} height={202} rx={20} fill="#f8fafc" stroke={LINE} strokeWidth={1.5} />
        <rect x={16} y={170} width={528} height={4} rx={2} fill={BLUE} opacity={0.9} />
        <image href={apexBullLogo.url} x={34} y={186} width={46} height={30} preserveAspectRatio="xMidYMid meet" />
        <text x={92} y={204} fontSize={15} fontWeight={800} fill={INK}>Apex layer</text>
        <text x={92} y={221} fontSize={11.5} fill={MUTED}>Checks every call before anything is read</text>
        {chips.map(([id, label, planned], i) => {
          const x = 36 + i * 98;
          return (
            <g key={id} className="ai-tile" {...hover(id)}>
              <rect className="ai-bg" x={x} y={246} width={90} height={74} rx={12} fill={planned ? "#f8fafc" : "#fff"} stroke={planned ? LINE : "#93c5fd"} strokeWidth={1.5} strokeDasharray={planned ? "5 4" : undefined} style={{ transition: "all .2s" }} />
              <circle cx={x + 45} cy={272} r={9} fill={planned ? "#e2e8f0" : "#dcfce7"} />
              {planned ? (
                <circle cx={x + 45} cy={272} r={3} fill="#94a3b8" />
              ) : (
                <path d={`M ${x + 40.5} 272 l 3.2 3.2 l 6 -6.4`} stroke="#15803d" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              <text x={x + 45} y={299} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={planned ? MUTED : INK}>{label}</text>
              <text x={x + 45} y={313} textAnchor="middle" fontSize={9.5} fill={planned ? "#94a3b8" : "#15803d"} fontWeight={600}>{planned ? "PLANNED" : "LIVE"}</text>
            </g>
          );
        })}
        <text x={280} y={352} textAnchor="middle" fontSize={11.5} fill={MUTED}>Same subscription and permission rules as the app</text>

        {/* sources */}
        {sources.map(([id, label, sub], i) => {
          const x = 16 + i * 180;
          return (
            <g key={id} className="ai-tile" {...hover(id)}>
              <rect className="ai-bg" x={x} y={436} width={168} height={72} rx={14} fill="#fff" stroke={LINE} strokeWidth={1.5} style={{ transition: "all .2s" }} />
              {id === "amazon" ? (
                <Icon d={AMAZON_PATH} x={x + 28} y={472} size={24} />
              ) : id === "catalog" ? (
                <g stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round">
                  <rect x={x + 17} y={462} width={22} height={6} rx={2} /><rect x={x + 17} y={470} width={22} height={6} rx={2} /><rect x={x + 17} y={478} width={22} height={6} rx={2} />
                </g>
              ) : (
                <path d={`M ${x + 16} 484 L ${x + 24} 472 L ${x + 30} 478 L ${x + 40} 462`} stroke={INK} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              <text x={x + 48} y={468} fontSize={12} fontWeight={700} fill={INK}>{label}</text>
              <text x={x + 48} y={485} fontSize={10} fill={MUTED}>{sub}</text>
            </g>
          );
        })}

        {/* legend */}
        <g fontSize={11} fill={MUTED}>
          <rect x={16} y={527} width={22} height={8} rx={4} fill="#fff" stroke="#93c5fd" strokeWidth={1.5} />
          <text x={46} y={535}>Live</text>
          <rect x={92} y={527} width={22} height={8} rx={4} fill="#f8fafc" stroke={LINE} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={122} y={535}>Planned</text>
        </g>
      </svg></div>
      <p className="mt-1 text-center text-[11px] text-slate-400 sm:hidden">Swipe the diagram sideways</p>

      <div className="mt-3 min-h-[92px] rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="mb-1 flex items-center gap-2.5">
          <span className="text-sm font-bold text-slate-900">{item.title}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TAG_STYLE[item.tag]}`}>{TAG_LABEL[item.tag]}</span>
        </div>
        <p className="text-[13px] leading-relaxed text-slate-600">{item.caption}</p>
      </div>
    </div>
  );
}
