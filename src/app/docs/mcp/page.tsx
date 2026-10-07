import type { Metadata } from "next";

import IntegrationGuide, { CodeBlock, Troubleshooting } from "../../../components/IntegrationGuide";
import { AI_CONNECTOR } from "../../../config/product";
import { pageMetadata } from "../../../lib/seo";
import MCP_TOOLS from "../../../data/mcpTools.json";

const PATH = "/docs/mcp";
const L = AI_CONNECTOR.limits;

export const metadata: Metadata = pageMetadata({
  title: "Apex MCP Server Reference: Endpoint, Auth, Tools and Limits",
  description:
    "Technical reference for the Apex MCP server: Streamable HTTP endpoint, connector keys, read and draft tools with their inputs, permissions, rate limits, errors and revocation.",
  path: PATH,
});

/**
 * The tool list is `data/mcpTools.json`, generated from the backend's compiled
 * MCP modules (lib/mcp/tools.js, researchTools.js, writeTools.js) on
 * 2026-10-07: names, descriptions and JSON schemas exactly as `tools/list`
 * returns them. Regenerate it when a tool changes rather than editing it here.
 */
type Param = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  maxItems?: number;
};
type Tool = { name: string; write: boolean; description: string; params: Param[] };
const TOOLS = MCP_TOOLS as Tool[];

const range = (p: Param) => {
  const bits: string[] = [];
  if (p.enum) bits.push(p.enum.join(" | "));
  if (p.minimum !== undefined || p.maximum !== undefined) bits.push(`${p.minimum ?? "any"} to ${p.maximum ?? "any"}`);
  if (p.maxItems !== undefined) bits.push(`max ${p.maxItems} items`);
  return bits.join(", ");
};

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article id={tool.name} className="scroll-mt-28 rounded-2xl border border-slate-200">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="font-mono text-[14px] font-bold text-slate-900">{tool.name}</h3>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tool.write ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {tool.write ? "Draft, write link, Pro" : "Read, any link"}
        </span>
      </header>
      <div className="px-4 py-3">
        <p className="text-[15px] leading-relaxed text-slate-600">{tool.description}</p>
        {tool.params.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <caption className="sr-only">Arguments for {tool.name}</caption>
              <thead className="text-slate-900">
                <tr className="border-b border-slate-200">
                  <th scope="col" className="py-2 pr-3 font-semibold">Argument</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Required</th>
                  <th scope="col" className="py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {tool.params.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2 pr-3 align-top font-mono text-slate-900">{p.name}</td>
                    <td className="py-2 pr-3 align-top">{p.type}</td>
                    <td className="py-2 pr-3 align-top">{p.required ? "Yes" : "No"}</td>
                    <td className="py-2 align-top">
                      {p.description}
                      {range(p) && <span className="block text-xs text-slate-500">{range(p)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No arguments.</p>
        )}
      </div>
    </article>
  );
}

export default function Page() {
  const read = TOOLS.filter((t) => !t.write);
  const write = TOOLS.filter((t) => t.write);

  return (
    <IntegrationGuide
      eyebrow="Developer reference"
      h1="Apex MCP server reference"
      intro={
        <p>
          Apex runs a Model Context Protocol server so an AI assistant can read a seller&rsquo;s own Apex data and, with a
          separate write link on the Pro plan, prepare drafts. This page is the reference for the endpoint, keys,
          permissions, tools, limits and errors. For setup in a specific assistant, see the{" "}
          <a href="/integrations/claude">Claude</a> and <a href="/integrations/chatgpt">ChatGPT</a> guides.
        </p>
      }
      facts={[
        ["Endpoint", <code key="e" className="break-all font-mono text-[13px]">{AI_CONNECTOR.endpoint}</code>],
        ["Transport", "Streamable HTTP, stateless"],
        ["Auth", "Per-seller connector key"],
        ["Tools", `${read.length} read, ${write.length} draft`],
      ]}
      path={PATH}
      breadcrumb={[
        { name: "Home", path: "/" },
        { name: "AI integrations", path: "/ai" },
        { name: "MCP reference", path: PATH },
      ]}
      checked={{
        date: AI_CONNECTOR.lastVerified,
        label: "October 7, 2026",
        how: <p>Checked against the Apex MCP server code running in production that day. Tool names, descriptions and arguments are generated from the server&rsquo;s own definitions.</p>,
      }}
      related={[
        { label: "What sellers can ask", href: "/ai" },
        { label: "Connect Claude", href: "/integrations/claude" },
        { label: "Connect ChatGPT", href: "/integrations/chatgpt" },
        { label: "Plans and pricing", href: "/pricing" },
      ]}
      sections={[
        {
          id: "endpoint",
          title: "Endpoint and transport",
          body: (
            <>
              <p>
                <strong>POST</strong> <code>{AI_CONNECTOR.endpoint}</code> with the key as a bearer token, or{" "}
                <strong>POST</strong> <code>{AI_CONNECTOR.endpoint}/apx_YOUR_KEY</code> for clients that only accept a
                URL.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Stateless Streamable HTTP: one JSON-RPC 2.0 message (or a batch array) per POST, plain JSON back. No sessions and no server-to-client stream.</li>
                <li><code>GET</code> answers 405. Notifications (requests without an <code>id</code>) answer 202 with no body.</li>
                <li>Supported protocol versions: <code>2025-06-18</code>, <code>2025-03-26</code>, <code>2024-11-05</code>. The server answers with the version the client asked for when it is one of these, otherwise the newest.</li>
                <li>Methods: <code>initialize</code>, <code>ping</code>, <code>tools/list</code>, <code>tools/call</code>.</li>
              </ul>
              <CodeBlock label="List the tools">{`curl -s ${AI_CONNECTOR.endpoint} \\
  -H "Authorization: Bearer apx_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</CodeBlock>
            </>
          ),
        },
        {
          id: "auth",
          title: "Keys and authentication",
          body: (
            <>
              <p>
                A seller makes keys in Apex under <strong>Connect your AI</strong> in the account menu. A key belongs to one
                Apex account and the user who made it. Apex stores only a hash of it and shows the plain key once.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong>Read keys</strong> see the read tools only. This is the default.</li>
                <li><strong>Write keys</strong> also see the draft tools. Making one needs the Pro plan and edit permission for purchase orders, products and vendors.</li>
                <li>Up to {L.liveKeysPerAccount} live keys per account, of which up to {L.writeKeysPerAccount} may be write keys.</li>
                <li>Keys in a URL can end up in logs and browser history. Prefer the header form where the client supports it, and turn off any key you have exposed.</li>
              </ul>
              <p>OAuth is not supported yet. It is planned.</p>
            </>
          ),
        },
        {
          id: "permissions",
          title: "Permission enforcement",
          body: (
            <>
              <p>
                Every tool runs the same plan and permission checks as the page it mirrors in the Apex app, using the
                permissions of the user who made the key, read again on every call. A key never sees more than that user
                does, and the account always comes from the key, never from the arguments.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Read tools: a paid Apex plan (the trial counts) plus the matching view permission.</li>
                <li>Draft tools: a write key, the Pro plan checked on every call, and the matching edit permissions. A downgrade stops an existing write key from drafting.</li>
                <li>A read key that calls a draft tool anyway is refused and the attempt is logged.</li>
              </ul>
            </>
          ),
        },
        {
          id: "read-write",
          title: "Reads and drafts",
          body: (
            <>
              <p>
                Read tools carry <code>readOnlyHint: true</code>. Draft tools carry <code>readOnlyHint: false</code>,{" "}
                <code>destructiveHint: false</code> and <code>idempotentHint: true</code>, which is what makes clients such
                as ChatGPT and Claude ask the user before each call.
              </p>
              <p>
                Draft tools only create drafts: an open purchase order that is never submitted, products added as drafts that
                are never activated, or a new supplier. Each returns what it made and a link to review it in Apex. No tool
                can {AI_CONNECTOR.never.slice(0, -1).join(", ")} or {AI_CONNECTOR.never[AI_CONNECTOR.never.length - 1]}.
              </p>
              <p>
                <code>create_draft_purchase_order</code> accepts a <code>requestId</code>. The same id within 24 hours returns
                the first order instead of creating a second.
              </p>
            </>
          ),
        },
        {
          id: "tools",
          title: "Tools",
          body: (
            <div className="space-y-4">
              <p>Names, descriptions and arguments exactly as <code>tools/list</code> returns them.</p>
              <h3 className="pt-2 text-lg font-bold text-slate-900">Read tools</h3>
              {read.map((t) => <ToolCard key={t.name} tool={t} />)}
              <h3 className="pt-4 text-lg font-bold text-slate-900">Draft tools (write keys, Pro)</h3>
              {write.map((t) => <ToolCard key={t.name} tool={t} />)}
            </div>
          ),
        },
        {
          id: "output",
          title: "Results and paging",
          body: (
            <>
              <p>
                A successful <code>tools/call</code> returns the result twice: as text in <code>content</code> for the model,
                and as the same object in <code>structuredContent</code> for clients that read JSON.
              </p>
              <CodeBlock label="Example result, illustrative values">{`{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [{ "type": "text", "text": "{ \\"items\\": [ ... ] }" }],
    "structuredContent": {
      "items": [
        { "title": "Example product A", "daysOfInventory": 6, "recommendedQty": 120 }
      ]
    }
  }
}`}</CodeBlock>
              <p>
                Lists are capped so results fit a model&rsquo;s context: most tools take a <code>limit</code> (typically up to
                25 or 50) and a <code>page</code>, and return a total so the caller can ask for more. Money is rounded to two
                places.
              </p>
            </>
          ),
        },
        {
          id: "limits",
          title: "Rate limits and quotas",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>{L.callsPerMinutePerKey} calls a minute per key, and {L.callsInFlightPerAccount} calls in flight per account.</li>
              <li>Write keys: {L.writeCallsPerMinutePerKey} draft calls a minute per key, and {L.draftsPerDayPerAccount} draft-creating calls per account per UTC day.</li>
              <li>Purchase orders: 1 to {L.poLinesMax} lines, quantities 1 to 100,000. Products: up to {L.productsPerCallMax} per call.</li>
              <li><code>search_brands</code> and <code>research_products</code> spend the plan&rsquo;s monthly brand searches exactly as the app does.</li>
              <li>The minute limits are enforced per server instance, as a guard against runaway loops rather than an exact quota.</li>
            </ul>
          ),
        },
        {
          id: "errors",
          title: "Errors",
          body: (
            <Troubleshooting
              items={[
                ["HTTP 401", "No key, an unknown key, or a key that has been turned off."],
                ["HTTP 405", "A GET request. The server takes POST only."],
                ["JSON-RPC -32600", "The body is not a JSON-RPC 2.0 request."],
                ["JSON-RPC -32601", "An unknown method."],
                [
                  "A tool result with isError: true",
                  "The call reached the tool but was refused or failed: an unknown tool, a missing plan or permission, a read key calling a draft tool, a rate or daily limit, or invalid arguments. The text explains it in plain words so the assistant can pass it on, for example “This link is read-only. Make a write link in Connect your AI.”",
                ],
              ]}
            />
          ),
        },
        {
          id: "audit",
          title: "Audit log",
          body: (
            <p>
              Every call made through a write key, successful or refused, is recorded with the key&rsquo;s name, the client,
              the tool, a summary of the arguments and the result. Arguments are summarised, never stored whole, and no
              secret is recorded. The seller sees recent entries under Connect your AI. Turning a key off keeps its history.
            </p>
          ),
        },
        {
          id: "revoke",
          title: "Revoking a key",
          body: (
            <p>
              In Apex, open Connect your AI, find the key under Your links and choose Turn off. The next call with that key
              answers 401. A key also stops working when its user loses access to the account.
            </p>
          ),
        },
        {
          id: "versions",
          title: "Versioning and changes",
          body: (
            <>
              <p>
                The server identifies itself as <code>apex-applications</code> version <code>1.0.0</code> in{" "}
                <code>initialize</code>. Tools are added over time, and this page is regenerated from the server&rsquo;s own
                definitions when they change.
              </p>
              <p>
                Clients cache the tool list. After a change, refresh the connector in your client (ChatGPT has a Refresh
                button on the plugin) or start a new chat.
              </p>
              <p>Planned, not available: {AI_CONNECTOR.planned.join("; ").toLowerCase()}.</p>
            </>
          ),
        },
      ]}
    />
  );
}

export const dynamic = "force-static";
