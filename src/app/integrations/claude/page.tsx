import type { Metadata } from "next";

import IntegrationGuide, { CodeBlock, Steps, Troubleshooting } from "../../../components/IntegrationGuide";
import { AI_CLIENTS, AI_CONNECTOR, COMPANY } from "../../../config/product";
import { pageMetadata } from "../../../lib/seo";

const CLAUDE = AI_CLIENTS.claude;
const PATH = "/integrations/claude";

export const metadata: Metadata = pageMetadata({
  title: "Connect Claude to Your Amazon Business | Apex Setup Guide",
  description:
    "Add Apex to Claude as a custom connector and ask about your Amazon profit, stock, purchase orders and supplier scans. Setup, a first test, troubleshooting and how to remove it.",
  path: PATH,
  // Public, but out of the index until someone has walked these screens with a
  // real link (see AI_CLIENTS.interfaceTested in config/product.ts).
  extra: CLAUDE.interfaceTested ? undefined : { robots: { index: false, follow: true } },
});

const APP = COMPANY.appUrl;

export default function Page() {
  return (
    <IntegrationGuide
      eyebrow="AI integrations · Claude"
      h1="Connect Claude to your Amazon business through Apex"
      intro={
        <p>
          Add Apex to Claude as a custom connector and Claude can answer questions from your own Apex data: profit and loss,
          inventory, purchase orders, supplier scans and repricing. On the Apex Pro plan you can add a second, write
          connector so Claude can prepare draft purchase orders for you to review.
        </p>
      }
      facts={[
        ["Works in", "Claude on the web, the desktop app, the mobile apps and Claude Code"],
        ["Apex plan", "Any paid plan for reading, trial included. Pro for drafts."],
        ["Claude plan", "Free (one custom connector), Pro, Max, Team or Enterprise"],
        ["Time", "About two minutes"],
      ]}
      path={PATH}
      breadcrumb={[
        { name: "Home", path: "/" },
        { name: "AI integrations", path: "/ai" },
        { name: "Claude", path: PATH },
      ]}
      checked={{
        date: CLAUDE.lastTested,
        label: "October 7, 2026",
        how: (
          <p>
            Steps checked against Anthropic&rsquo;s{" "}
            <a href={CLAUDE.docs} rel="noopener" target="_blank">custom connectors help page</a> and against Apex&rsquo;s
            connector code. Claude connections to Apex are in use in production. Claude moves its menus from time to
            time: if a label here does not match what you see, the help page has the current one.
          </p>
        ),
      }}
      related={[
        { label: "What you can ask your assistant", href: "/ai" },
        { label: "Connect ChatGPT instead", href: "/integrations/chatgpt" },
        { label: "Apex MCP reference", href: "/docs/mcp" },
        { label: "Plans and pricing", href: "/pricing" },
      ]}
      sections={[
        {
          id: "before",
          title: "Before you start",
          body: (
            <>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>An Apex account on a paid plan or the seven-day trial,</strong> with your Amazon account connected.
                  Claude reads what Apex has synced, so an account with no Amazon connection and no products gives empty
                  answers.
                </li>
                <li>
                  <strong>Product costs in your Apex database</strong> if you want profit, ROI and reorder answers. Apex can
                  only rank what it can price.
                </li>
                <li>
                  <strong>A Claude account.</strong> {CLAUDE.plans}
                </li>
                <li>
                  <strong>For drafts:</strong> the Apex Pro plan, and edit access to purchase orders, products and vendors in
                  Apex for the person making the link.
                </li>
              </ul>
              <p>
                Claude sees exactly what the Apex user who made the link can see, and nothing more. An authorized user with
                limited permissions makes a link with the same limits.
              </p>
            </>
          ),
        },
        {
          id: "link",
          title: "1. Make your Apex link",
          body: (
            <Steps
              items={[
                { title: "Open Connect your AI", body: <>Sign in to <a href={`${APP}/settings/claude`}>Apex</a>, open your account menu and choose <strong>Claude</strong> under Connect your AI.</> },
                { title: "Click Make my link", body: <>Apex shows a private link once. Copy it straight away. If you lose it, make a new one; the old one keeps working until you turn it off.</> },
                { title: "Optional: Make a write link (Pro)", body: <>Further down the same page, <strong>Make a write link</strong> creates a second link that can also make drafts. Keep it separate so you can tell the two apart in Claude.</> },
              ]}
            />
          ),
        },
        {
          id: "add",
          title: "2. Add Apex in Claude",
          body: (
            <>
              <Steps
                items={[
                  { title: "Open Connectors", body: <>In Claude, go to <strong>Customize</strong>, then <strong>Connectors</strong>, then <strong>Add</strong> and <strong>Add custom connector</strong>. On a Team or Enterprise plan an owner does this under <strong>Organization settings</strong>, <strong>Connectors</strong>, <strong>Add</strong>, <strong>Custom</strong>, <strong>Web</strong>.</> },
                  { title: "Name it and paste the link", body: <>Name it <strong>Apex</strong> and paste your link as the server URL. The key is already inside the link, so Claude does not need a sign-in. Click <strong>Add</strong>.</> },
                  { title: "Add the write link too, if you made one", body: <>Repeat with the write link and name it <strong>Apex Draft</strong>.</> },
                ]}
              />
              <p>Your link looks like this, with your own key at the end:</p>
              <CodeBlock>{`${AI_CONNECTOR.endpoint}/apx_YOUR_KEY`}</CodeBlock>
            </>
          ),
        },
        {
          id: "code",
          title: "Using Claude Code instead",
          body: (
            <>
              <p>
                Claude Code can send the key as a header, which keeps it out of the URL. On the Connect your AI page in
                Apex, the command appears under your link once it is made. It has this shape:
              </p>
              <CodeBlock label="Terminal">{`claude mcp add --transport http apex ${AI_CONNECTOR.endpoint} \\
  --header "Authorization: Bearer apx_YOUR_KEY"`}</CodeBlock>
              <p>To remove it later, run <code>claude mcp remove apex</code>.</p>
            </>
          ),
        },
        {
          id: "test",
          title: "3. Try a first question",
          body: (
            <>
              <p>
                Start a new chat. Click the <strong>+</strong> button at the bottom left, open <strong>Connectors</strong> and
                make sure Apex is switched on. Then ask:
              </p>
              <CodeBlock>{"What made me the most money last month?"}</CodeBlock>
              <p>
                Claude should call Apex&rsquo;s profit and loss tool and answer with your sales, fees, cost of goods and gross
                profit by month. The first time it uses a tool, Claude asks your permission. You can allow it once or always.
              </p>
            </>
          ),
        },
        {
          id: "workflow",
          title: "A weekly reorder routine",
          body: (
            <>
              <p>One way sellers use it every week, in a single chat:</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li><strong>&ldquo;Which profitable products are lowest on stock?&rdquo;</strong> Claude reads your restock list and inventory.</li>
                <li><strong>&ldquo;Leave out anything with more than 30 days of stock or inbound units.&rdquo;</strong> Claude narrows the list from the same data.</li>
                <li><strong>&ldquo;Group what is left by supplier.&rdquo;</strong> So you see one order per supplier.</li>
                <li>
                  <strong>&ldquo;Draft a purchase order for Example Supplier with those quantities.&rdquo;</strong> With the Apex Draft
                  connector on (Pro), Claude asks your permission, creates the draft and gives you a link to it.
                </li>
                <li>Open the draft in Apex Blue, check costs and quantities, and submit it yourself.</li>
              </ol>
              <p>
                Claude cannot submit the order, contact the supplier or send anything. The draft waits in Apex until you act
                on it.
              </p>
            </>
          ),
        },
        {
          id: "trouble",
          title: "Troubleshooting",
          body: (
            <Troubleshooting
              items={[
                ["Claude answers without using Apex", <>Check that Apex is switched on for this chat under <strong>+</strong>, <strong>Connectors</strong>. Mentioning Apex in your question also helps: &ldquo;Using Apex, &hellip;&rdquo;.</>],
                ["Claude says it cannot connect, or Apex answers 401", <>The link was turned off, mistyped or cut short. Make a new link in Apex and replace the connector&rsquo;s URL.</>],
                ["“This link is read-only. Make a write link in Connect your AI.”", <>You asked for a draft through the read connector. Make a write link on Pro and add it as <strong>Apex Draft</strong>.</>],
                ["“Write access is part of the Pro plan”", <>Drafts need the Pro plan. Reading still works on your current plan.</>],
                ["The answer is empty or says there is nothing to show", <>Apex has nothing to read yet: connect your Amazon account in Apex, add products with costs, or run a supplier scan first.</>],
                ["“Write limit reached” or “Daily limit reached”", <>You hit the draft limits ({AI_CONNECTOR.limits.writeCallsPerMinutePerKey} a minute, {AI_CONNECTOR.limits.draftsPerDayPerAccount} a day per account). Wait and try again; drafts already made are waiting in Apex.</>],
                ["New Apex tools do not show up", <>Start a new chat. If they still do not appear, remove the Apex connector and add it again with the same link.</>],
              ]}
            />
          ),
        },
        {
          id: "remove",
          title: "Turn off access",
          body: (
            <>
              <p>
                <strong>In Apex:</strong> open Connect your AI, find the link under <strong>Your links</strong> and click{" "}
                <strong>Turn off</strong>. It stops working straight away, for Claude and anything else using it. Drafts it
                already made stay in Apex, and the write link&rsquo;s history stays in the audit list.
              </p>
              <p>
                <strong>In Claude:</strong> go to <strong>Customize</strong>, <strong>Connectors</strong>, and choose{" "}
                <strong>Remove</strong> from the menu next to Apex. Removing it from Claude does not turn the link off, so do
                both if the link may have been shared.
              </p>
            </>
          ),
        },
        {
          id: "limits",
          title: "Known limitations",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Claude reads what Apex has synced from Amazon, not Seller Central directly, so figures can be a few minutes behind.</li>
              <li>It cannot upload a supplier price list or start a scan. Run the scan in Apex Green, then ask about it.</li>
              <li>Lists come back in capped pages, so very large questions may need to be narrowed.</li>
              <li>Drafts only: Claude can never submit or send a purchase order, spend money, create a shipment or change a live price.</li>
              <li>The link carries its key, so treat it like a password. Signing in with OAuth instead is planned, not available.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}

export const dynamic = "force-static";
