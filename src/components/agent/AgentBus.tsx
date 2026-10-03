"use client";

import { useEffect, useRef } from "react";

import apexBullLogo from "../../assets/apex-bull-logo.png.asset.json";
import { AMAZON_PATH, CLAUDE_PATH, CURSOR_PATH, GEMINI_PATH, OPENAI_PATH } from "./logos";

/**
 * The animated hero: agents on one side, destinations on the other, Apex in the
 * middle, and request packets travelling between them.
 *
 * It is a picture of how the connector works, so it is held to the same rule as
 * the copy: only Live things carry traffic. Planned things are dashed, and the
 * one planned path (purchase orders) shows a packet stopping at an approval
 * gate, because that is what the planned design does.
 */

export type NodeStatus = "live" | "beta" | "planned" | "client";

export interface BusNode {
  id: string;
  label: string;
  group: "agent" | "dest";
  status: NodeStatus;
  caption: string;
  title: string;
}

export const BUS_NODES: BusNode[] = [
  { id: "claude", label: "Claude", title: "Claude", group: "agent", status: "client",
    caption: "Apex's connector is built for Claude.ai, Claude Desktop and Claude Code. Add it as a custom connector or MCP server with a key from Settings." },
  { id: "chatgpt", label: "ChatGPT", title: "ChatGPT", group: "agent", status: "client",
    caption: "Apex speaks standard MCP over HTTP, so clients that support remote MCP servers can connect. Not individually tested yet." },
  { id: "gemini", label: "Gemini", title: "Gemini", group: "agent", status: "client",
    caption: "Same standard MCP endpoint. Any client that can call a remote MCP server with a bearer key can use it. Not individually tested yet." },
  { id: "cursor", label: "Cursor", title: "Cursor", group: "agent", status: "client",
    caption: "Same standard MCP endpoint, for coding agents and editors that support remote MCP. Not individually tested yet." },
  { id: "amazon", label: "Amazon data", title: "Your Amazon data", group: "dest", status: "live",
    caption: "Apex syncs your own Amazon account's orders, inventory and fees every few minutes. Agents read that synced data, never Amazon directly." },
  { id: "catalog", label: "Catalog", title: "Catalog and scans", group: "dest", status: "live",
    caption: "Your product database and supplier catalog scans, matched against Apex's Amazon catalog of 120M+ ASINs." },
  { id: "pnl", label: "Profit & loss", title: "Profit and loss", group: "dest", status: "live",
    caption: "Monthly P&L and a day, week or month statement: sales, fees, cost of goods and gross profit." },
  { id: "inventory", label: "Inventory", title: "Inventory and restock", group: "dest", status: "live",
    caption: "FBA stock, sales velocity, days of inventory and what to reorder." },
  { id: "repricer", label: "Repricer", title: "Repricer", group: "dest", status: "beta",
    caption: "Reading listings, impact and MAP risk works today. The repricer itself is in Beta. Letting an agent change prices is planned, behind approval." },
  { id: "orders", label: "Purchase orders", title: "Purchase orders", group: "dest", status: "planned",
    caption: "Planned. An agent will be able to draft a purchase order, and nothing is created until you approve it." },
];

const COLORS: Record<NodeStatus, string> = {
  live: "#34d399",
  beta: "#fbbf24",
  planned: "#94a3b8",
  client: "#60a5fa",
};

const LOGO_PATHS: Record<string, string> = {
  claude: CLAUDE_PATH,
  chatgpt: OPENAI_PATH,
  gemini: GEMINI_PATH,
  cursor: CURSOR_PATH,
  amazon: AMAZON_PATH,
};

const CALLS = [
  "get_restock_recommendations",
  "get_inventory",
  "get_profit_and_loss_statement",
  "get_catalog_scan_results",
  "search_products",
  "get_profitable_opportunities",
  "get_repricer_impact",
  "get_business_snapshot",
];

interface Pt { x: number; y: number }
interface Edge { a: Pt; b: Pt; c1: Pt; c2: Pt; from: string; to: string; planned: boolean }
interface Seg { edge: number; rev: boolean; gate?: boolean }
interface Packet {
  route: Seg[];
  s: number;
  speed: number;
  color: string;
  trail: Pt[];
  hold: number;
  call: string;
  response: boolean;
  gated: boolean;
}

const bez = (e: Edge, u: number): Pt => {
  const v = 1 - u;
  return {
    x: v * v * v * e.a.x + 3 * v * v * u * e.c1.x + 3 * v * u * u * e.c2.x + u * u * u * e.b.x,
    y: v * v * v * e.a.y + 3 * v * v * u * e.c1.y + 3 * v * u * u * e.c2.y + u * u * u * e.b.y,
  };
};

export default function AgentBus({
  mode,
  hovered,
  onHover,
}: {
  mode: "today" | "planned";
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const hoverRef = useRef(hovered);
  const hoverCb = useRef(onHover);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { hoverRef.current = hovered; }, [hovered]);
  useEffect(() => { hoverCb.current = onHover; }, [onHover]);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bull = new Image();
    bull.src = apexBullLogo.url;

    let W = 0;
    let H = 0;
    let mobile = false;
    let pos: Record<string, Pt> = {};
    let core: Pt = { x: 0, y: 0 };
    let edges: Edge[] = [];
    let nodeSize = 64;
    const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, r: 0.5 + Math.random() * 1.4 }));
    const packets: Packet[] = [];
    const log: { text: string; at: number }[] = [];
    let corePulse = 0;
    let spawnAt = 0;
    let gatedAt = 2.2;
    let visible = true;
    let raf = 0;
    const paths: Record<string, Path2D> = {};
    for (const k in LOGO_PATHS) paths[k] = new Path2D(LOGO_PATHS[k]);

    const layout = () => {
      const r = el.getBoundingClientRect();
      W = r.width;
      mobile = W < 720;
      H = mobile ? 780 : Math.max(500, Math.min(580, W * 0.44));
      el.style.height = `${H}px`;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const agents = BUS_NODES.filter((n) => n.group === "agent");
      const dests = BUS_NODES.filter((n) => n.group === "dest");
      pos = {};
      if (mobile) {
        nodeSize = 54;
        agents.forEach((n, i) => (pos[n.id] = { x: W * (0.125 + 0.25 * i), y: H * 0.1 }));
        core = { x: W / 2, y: H * 0.43 };
        dests.forEach((n, i) => (pos[n.id] = { x: W * (0.2 + 0.3 * (i % 3)), y: H * (i < 3 ? 0.72 : 0.9) }));
      } else {
        nodeSize = H < 560 ? 54 : 62;
        agents.forEach((n, i) => (pos[n.id] = { x: W * 0.1, y: H * (0.17 + (0.66 / 3) * i) }));
        core = { x: W * 0.5, y: H * 0.5 };
        dests.forEach((n, i) => (pos[n.id] = { x: W * 0.9, y: H * (0.13 + (0.76 / 5) * i) }));
      }
      edges = [];
      const mk = (from: string, to: string, a: Pt, b: Pt, planned: boolean) => {
        const dx = (b.x - a.x) * 0.5;
        const dy = (b.y - a.y) * 0.5;
        edges.push(
          mobile
            ? { a, b, c1: { x: a.x, y: a.y + dy }, c2: { x: b.x, y: b.y - dy }, from, to, planned }
            : { a, b, c1: { x: a.x + dx, y: a.y }, c2: { x: b.x - dx, y: b.y }, from, to, planned },
        );
      };
      agents.forEach((n) => mk(n.id, "core", pos[n.id], core, false));
      dests.forEach((n) => mk("core", n.id, core, pos[n.id], n.status === "planned"));
    };

    const edgeFor = (from: string, to: string) => edges.findIndex((e) => e.from === from && e.to === to);

    const spawn = (t: number, gated: boolean) => {
      const agents = BUS_NODES.filter((n) => n.group === "agent");
      const dests = BUS_NODES.filter((n) => n.group === "dest" && (gated ? n.id === "orders" : n.status !== "planned"));
      const a = agents[Math.floor(Math.random() * agents.length)];
      const d = dests[Math.floor(Math.random() * dests.length)];
      const call = gated ? "draft_purchase_order" : CALLS[Math.floor(Math.random() * CALLS.length)];
      packets.push({
        route: [
          { edge: edgeFor(a.id, "core"), rev: false },
          { edge: edgeFor("core", d.id), rev: false, gate: gated },
        ],
        s: 0,
        speed: 0.5 + Math.random() * 0.25,
        color: gated ? "#fbbf24" : "#60a5fa",
        trail: [],
        hold: 0,
        call,
        response: false,
        gated,
      });
      log.unshift({ text: `${gated ? "propose" : "call"} ${call}`, at: t });
      if (log.length > 4) log.pop();
    };

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawIcon = (id: string, cx: number, cy: number, size: number, color: string) => {
      ctx.save();
      ctx.translate(cx, cy);
      const p = paths[id];
      if (p) {
        const s = size / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fillStyle = color;
        ctx.fill(p);
      } else {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const u = size / 2;
        if (id === "catalog") {
          for (let i = 0; i < 3; i++) {
            roundRect(-u * 0.9, -u * 0.8 + i * u * 0.62, u * 1.8, u * 0.42, 3);
            ctx.stroke();
          }
        } else if (id === "pnl") {
          ctx.beginPath();
          ctx.moveTo(-u, u * 0.7);
          ctx.lineTo(-u * 0.35, -u * 0.1);
          ctx.lineTo(u * 0.15, u * 0.35);
          ctx.lineTo(u, -u * 0.8);
          ctx.stroke();
        } else if (id === "inventory") {
          roundRect(-u * 0.9, -u * 0.6, u * 1.8, u * 1.3, 4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-u * 0.9, -u * 0.1);
          ctx.lineTo(u * 0.9, -u * 0.1);
          ctx.stroke();
        } else if (id === "repricer") {
          ctx.beginPath();
          ctx.moveTo(-u * 0.9, -u * 0.35);
          ctx.lineTo(u * 0.7, -u * 0.35);
          ctx.moveTo(u * 0.35, -u * 0.75);
          ctx.lineTo(u * 0.8, -u * 0.35);
          ctx.lineTo(u * 0.35, 0.05);
          ctx.moveTo(u * 0.9, u * 0.45);
          ctx.lineTo(-u * 0.7, u * 0.45);
          ctx.moveTo(-u * 0.35, u * 0.05);
          ctx.lineTo(-u * 0.8, u * 0.45);
          ctx.lineTo(-u * 0.35, u * 0.85);
          ctx.stroke();
        } else if (id === "orders") {
          roundRect(-u * 0.6, -u * 0.9, u * 1.2, u * 1.8, 4);
          ctx.stroke();
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-u * 0.3, -u * 0.4 + i * u * 0.45);
            ctx.lineTo(u * 0.3, -u * 0.4 + i * u * 0.45);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible && !reduced) return;
      const t = now / 1000;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const planned = modeRef.current === "planned";
      const hov = hoverRef.current;

      ctx.clearRect(0, 0, W, H);

      /* perspective floor grid */
      ctx.save();
      const horizon = H * 0.62;
      const g = ctx.createLinearGradient(0, horizon, 0, H);
      g.addColorStop(0, "rgba(37,99,235,0)");
      g.addColorStop(1, "rgba(37,99,235,0.22)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 14, horizon);
        ctx.lineTo(W / 2 + i * W * 0.09, H);
        ctx.stroke();
      }
      for (let k = 0; k < 9; k++) {
        const f = ((k + (t * 0.25) % 1) / 9) ** 2.2;
        const y = horizon + (H - horizon) * f;
        ctx.globalAlpha = 0.15 + f * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      /* scan beam */
      {
        const bx = ((t * 0.12) % 1.4 - 0.2) * W;
        const bg = ctx.createLinearGradient(bx - 90, 0, bx + 90, 0);
        bg.addColorStop(0, "rgba(56,189,248,0)");
        bg.addColorStop(0.5, "rgba(56,189,248,0.07)");
        bg.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = bg;
        ctx.fillRect(bx - 90, 0, 180, H);
      }

      /* server racks behind the destinations */
      ctx.save();
      const rackX = mobile ? W * 0.04 : W * 0.8;
      const rackW = mobile ? W * 0.92 : W * 0.18;
      const rackTop = mobile ? H * 0.6 : H * 0.03;
      const rackBot = H * 0.97;
      for (let y = rackTop, i = 0; y < rackBot; y += 17, i++) {
        ctx.fillStyle = "rgba(148,163,184,0.045)";
        roundRect(rackX, y, rackW, 12, 3);
        ctx.fill();
        for (let k = 0; k < 3; k++) {
          const on = Math.sin(t * (1.3 + ((i * 7 + k * 3) % 5) * 0.37) + i * 1.7 + k) > 0.2;
          ctx.fillStyle = on ? (k === 0 ? "rgba(52,211,153,0.75)" : "rgba(96,165,250,0.6)") : "rgba(148,163,184,0.12)";
          ctx.beginPath();
          ctx.arc(rackX + rackW - 10 - k * 9, y + 6, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      /* dust */
      ctx.fillStyle = "rgba(147,197,253,0.5)";
      for (const d of dust) {
        d.y -= d.v * dt;
        if (d.y < 0) { d.y = 1; d.x = Math.random(); }
        ctx.globalAlpha = 0.15 + 0.35 * Math.abs(Math.sin(t * 0.6 + d.x * 9));
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* edges */
      edges.forEach((e) => {
        const isPlanned = e.planned;
        const touched = hov && (e.from === hov || e.to === hov || (hov && (BUS_NODES.find((n) => n.id === hov)?.group === "agent" ? e.to === "core" && e.from === hov : false)));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.bezierCurveTo(e.c1.x, e.c1.y, e.c2.x, e.c2.y, e.b.x, e.b.y);
        ctx.lineWidth = touched ? 2.4 : 1.4;
        ctx.strokeStyle = touched ? "rgba(96,165,250,0.95)" : isPlanned ? "rgba(148,163,184,0.32)" : "rgba(96,165,250,0.28)";
        if (isPlanned) ctx.setLineDash([6, 7]);
        if (isPlanned && !planned) ctx.globalAlpha = 0.35;
        ctx.stroke();
        ctx.restore();
        if (isPlanned && planned) {
          // the approval gate, drawn on the planned path
          const p = bez(e, 0.58);
          const pulse = 0.5 + 0.5 * Math.sin(t * 3);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = "rgba(15,23,42,0.9)";
          ctx.strokeStyle = `rgba(251,191,36,${0.6 + 0.4 * pulse})`;
          ctx.lineWidth = 2;
          roundRect(-9, -9, 18, 18, 4);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = "rgba(251,191,36,0.95)";
          ctx.textAlign = "center";
          ctx.fillText("APPROVAL", p.x, p.y - 18);
        }
      });

      /* packets */
      if (!reduced) {
        spawnAt -= dt;
        if (spawnAt <= 0) { spawn(t, false); spawnAt = 0.45 + Math.random() * 0.4; }
        if (planned) {
          gatedAt -= dt;
          if (gatedAt <= 0) { spawn(t, true); gatedAt = 3.8; }
        }
      } else if (packets.length === 0) {
        spawn(t, false);
        packets[0].s = 0.7;
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        const total = p.route.length;
        const seg = Math.min(total - 1, Math.floor(p.s));
        const u = p.s - seg;
        const sg = p.route[seg];
        const e = edges[sg.edge];
        if (!e) { packets.splice(i, 1); continue; }
        // hold at the approval gate
        const atGate = sg.gate && !p.response && u >= 0.58 && p.hold < 1.1;
        if (atGate) {
          p.hold += dt;
        } else if (!reduced) {
          p.s += p.speed * dt;
        }
        if (p.s >= total) {
          if (!p.response) {
            packets.push({
              route: p.route.slice().reverse().map((x) => ({ edge: x.edge, rev: true })),
              s: 0,
              speed: p.speed * 1.15,
              color: "#34d399",
              trail: [],
              hold: 0,
              call: p.call,
              response: true,
              gated: false,
            });
          }
          packets.splice(i, 1);
          continue;
        }
        const uu = sg.rev ? 1 - u : u;
        const pt = bez(e, uu);
        if (Math.abs(p.s % 1) < 0.03 && seg === 1 && !p.response) corePulse = 1;
        p.trail.push(pt);
        if (p.trail.length > 16) p.trail.shift();
        // trail
        for (let k = 0; k < p.trail.length; k++) {
          const a = k / p.trail.length;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = a * 0.55;
          ctx.beginPath();
          ctx.arc(p.trail[k].x, p.trail[k].y, 1 + a * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        const gl = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 16);
        gl.addColorStop(0, p.color);
        gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
        if (atGate) {
          ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = "rgba(251,191,36,1)";
          ctx.textAlign = "center";
          ctx.fillText("awaiting approval", pt.x, pt.y + 26);
        }
      }
      corePulse = Math.max(0, corePulse - dt * 2.2);

      /* core */
      const R = mobile ? 54 : 70;
      const glow = ctx.createRadialGradient(core.x, core.y, R * 0.4, core.x, core.y, R * (3 + corePulse));
      glow.addColorStop(0, `rgba(59,130,246,${0.5 + corePulse * 0.35})`);
      glow.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(core.x, core.y, R * (3 + corePulse), 0, Math.PI * 2);
      ctx.fill();
      for (let ring = 0; ring < 3; ring++) {
        ctx.save();
        ctx.translate(core.x, core.y);
        ctx.rotate(t * (0.25 + ring * 0.12) * (ring % 2 ? -1 : 1));
        ctx.strokeStyle = `rgba(147,197,253,${0.5 - ring * 0.12})`;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([ring === 0 ? 3 : 10, ring === 2 ? 16 : 8]);
        ctx.beginPath();
        ctx.arc(0, 0, R + 16 + ring * 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      // orbiting nodes: the four live checks
      const orbit = ["KEY", "PERMS", "READ-ONLY", ...(planned ? ["APPROVE", "AUDIT"] : [])];
      orbit.forEach((label, i) => {
        const ang = t * 0.5 + (i / orbit.length) * Math.PI * 2;
        const rr = R + 46;
        const x = core.x + Math.cos(ang) * rr;
        const y = core.y + Math.sin(ang) * rr * (mobile ? 1 : 0.62);
        const plannedItem = label === "APPROVE" || label === "AUDIT";
        ctx.font = "700 9px ui-monospace, SFMono-Regular, Menlo, monospace";
        const w = ctx.measureText(label).width + 14;
        ctx.fillStyle = "rgba(2,6,23,0.88)";
        ctx.strokeStyle = plannedItem ? "rgba(251,191,36,0.7)" : "rgba(52,211,153,0.7)";
        ctx.lineWidth = 1;
        roundRect(x - w / 2, y - 9, w, 18, 9);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = plannedItem ? "#fcd34d" : "#6ee7b7";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + 3);
      });
      ctx.beginPath();
      ctx.arc(core.x, core.y, R, 0, Math.PI * 2);
      const body = ctx.createLinearGradient(core.x - R, core.y - R, core.x + R, core.y + R);
      body.addColorStop(0, "#ffffff");
      body.addColorStop(1, "#dbeafe");
      ctx.fillStyle = body;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(96,165,250,0.95)";
      ctx.stroke();
      if (bull.complete && bull.naturalWidth) {
        const bw = R * 1.45;
        const bh = (bw * bull.naturalHeight) / bull.naturalWidth;
        ctx.drawImage(bull, core.x - bw / 2, core.y - bh / 2, bw, bh);
      }

      /* call ticker under the core */
      ctx.textAlign = "center";
      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      const ty = core.y + R + (mobile ? 74 : 92);
      log.forEach((l, i) => {
        ctx.fillStyle = `rgba(165,180,252,${0.9 - i * 0.22})`;
        ctx.fillText(`> ${l.text}`, core.x, ty + i * 16);
      });

      /* nodes */
      BUS_NODES.forEach((n) => {
        const p = pos[n.id];
        const hv = hov === n.id;
        const s = nodeSize * (hv ? 1.14 : 1);
        const dim = n.status === "planned" && !planned;
        ctx.save();
        ctx.globalAlpha = dim ? 0.38 : 1;
        if (hv || n.status !== "planned") {
          const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
          gl.addColorStop(0, `${COLORS[n.status]}${hv ? "66" : "30"}`);
          gl.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gl;
          ctx.beginPath();
          ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
          ctx.fill();
        }
        roundRect(p.x - s / 2, p.y - s / 2, s, s, s * 0.28);
        ctx.fillStyle = "rgba(15,23,42,0.78)";
        ctx.fill();
        ctx.lineWidth = hv ? 2.4 : 1.4;
        ctx.strokeStyle = hv ? "#93c5fd" : "rgba(148,163,184,0.4)";
        if (n.status === "planned") ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        drawIcon(n.id, p.x, p.y, s * 0.46, n.group === "agent" ? "#ffffff" : "#bfdbfe");
        // status dot
        ctx.fillStyle = COLORS[n.status];
        ctx.beginPath();
        ctx.arc(p.x + s / 2 - 5, p.y - s / 2 + 5, 4.5, 0, Math.PI * 2);
        ctx.fill();
        if (n.status === "live") {
          ctx.strokeStyle = "rgba(52,211,153,0.5)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x + s / 2 - 5, p.y - s / 2 + 5, 4.5 + ((t * 8) % 9), 0, Math.PI * 2);
          ctx.globalAlpha = (dim ? 0.38 : 1) * (1 - ((t * 8) % 9) / 9) * 0.6;
          ctx.stroke();
        }
        ctx.restore();
        ctx.font = `600 ${mobile ? 10.5 : 12.5}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = dim ? "rgba(203,213,225,0.45)" : "rgba(226,232,240,0.92)";
        ctx.fillText(n.label, p.x, p.y + s / 2 + (mobile ? 15 : 18));
      });
    };

    let last = performance.now();
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(el);
    raf = requestAnimationFrame(frame);

    const hit = (ev: MouseEvent | PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      let found: string | null = null;
      for (const n of BUS_NODES) {
        const p = pos[n.id];
        if (p && Math.abs(x - p.x) < nodeSize / 2 + 8 && Math.abs(y - p.y) < nodeSize / 2 + 8) found = n.id;
      }
      cv.style.cursor = found ? "pointer" : "default";
      return found;
    };
    const onMove = (ev: PointerEvent) => hoverCb.current(hit(ev));
    const onLeave = () => hoverCb.current(null);
    const onClick = (ev: MouseEvent) => { const f = hit(ev); if (f) hoverCb.current(f); };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrap} className="relative w-full" style={{ height: 620 }}>
      <canvas ref={canvas} className="absolute inset-0" role="img" aria-label="Animated diagram: AI agents send requests through Apex to your Amazon data and tools" />
    </div>
  );
}
