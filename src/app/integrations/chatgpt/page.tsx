import type { Metadata } from "next";

import IntegrationGuide, { CodeBlock, Steps, Troubleshooting } from "../../../components/IntegrationGuide";
import { AI_CLIENTS, AI_CONNECTOR, COMPANY } from "../../../config/product";
import { pageMetadata } from "../../../lib/seo";

const GPT = AI_CLIENTS.chatgpt;
const PATH = "/integrations/chatgpt";

export const metadata: Metadata = pageMetadata({
  title: "Connect ChatGPT to Your Amazon Business | Apex Setup Guide",
  description:
    "Add Apex to ChatGPT as a custom MCP server and ask about your Amazon profit, stock, supplier scans and purchase orders. Setup, a first test, troubleshooting and limits.",
  path: PATH,
  // Public, but out of the index until someone has walked these screens with a
  // real link (see AI_CLIENTS.interfaceTested in config/product.ts).
  extra: GPT.interfaceTested ? undefined : { robots: { index: false, follow: true } },
});

const APP = COMPANY.appUrl;

export default function Page() {
  return (
    <IntegrationGuide
      eyebrow="AI integrations · ChatGPT"
      h1="Connect ChatGPT to your Amazon business through Apex"
      intro={
        <p>
          Add Apex to ChatGPT as a custom MCP server and ChatGPT can work from your own Apex data: supplier scan results,
          product research, inventory, profit and loss and purchase orders. On the Apex Pro plan a second, write server
          lets ChatGPT add products and draft purchase orders, and ChatGPT asks you to confirm each one.
        </p>
      }
      facts={[
        ["Works in", "ChatGPT on the web"],
        ["Apex plan", "Any paid plan for reading, trial included. Pro for drafts."],
        ["ChatGPT plan", "A paid plan that allows custom MCP servers"],
        ["Time", "About three minutes"],
      ]}
      path={PATH}
      breadcrumb={[
        { name: "Home", path: "/" },
        { name: "AI integrations", path: "/ai" },
        { name: "ChatGPT", path: PATH },
      ]}
      checked={{
        date: GPT.lastTested,
        label: "October 7, 2026",
        how: (
          <p>
            Steps checked against OpenAI&rsquo;s{" "}
            <a href={GPT.docs} rel="noopener" target="_blank">Add custom MCP server guide</a> and against Apex&rsquo;s
            connector code. ChatGPT has connected to Apex in production. OpenAI renames these screens often: if a label
            here does not match what you see, their guide has the current one.
          </p>
        ),
      }}
      related={[
        { label: "What you can ask your assistant", href: "/ai" },
        { label: "Connect Claude instead", href: "/integrations/claude" },
        { label: "Apex MCP reference", href: "/docs/mcp" },
        { label: "Supplier catalog scanning", href: "/features/green" },
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
                </li>
                <li>
                  <strong>ChatGPT on the web.</strong> Custom MCP servers are added in a browser, not in the desktop or
                  mobile apps.
                </li>
                <li>
                  <strong>A ChatGPT plan that allows custom MCP servers.</strong> {GPT.plans} Some accounts also need
                  Developer mode turned on in ChatGPT&rsquo;s settings before the option appears.
                </li>
                <li>
                  <strong>For drafts:</strong> the Apex Pro plan, and edit access to purchase orders, products and vendors in
                  Apex for the person making the link.
                </li>
              </ul>
              <p>
                ChatGPT sees exactly what the Apex user who made the link can see. It reads through Apex, never through your
                Seller Central login.
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
                { title: "Open Connect your AI", body: <>Sign in to <a href={`${APP}/settings/chatgpt`}>Apex</a>, open your account menu and choose <strong>ChatGPT</strong> under Connect your AI.</> },
                { title: "Click Make my link", body: <>Copy the private link Apex shows. It is shown once; if you lose it, make a new one.</> },
                { title: "Optional: Make a write link (Pro)", body: <>Click <strong>Make a write link</strong> on the same page for a second link that can add products and draft purchase orders.</> },
              ]}
            />
          ),
        },
        {
          id: "add",
          title: "2. Add Apex in ChatGPT",
          body: (
            <>
              <Steps
                items={[
                  { title: "Open Plugins", body: <>In ChatGPT on the web, open <strong>Plugins</strong>, select the <strong>+</strong> button, then <strong>Add custom MCP server</strong>.</> },
                  { title: "Enter the details", body: <>Name it <strong>Apex</strong>. Under <strong>Connection</strong>, paste your link as the <strong>Server URL</strong>. Set authentication to <strong>No authentication</strong>: the key is already inside the link.</> },
                  { title: "Confirm", body: <>Read OpenAI&rsquo;s risk notice, select <strong>I understand and want to continue</strong>, then <strong>Create as a plugin</strong>.</> },
                  { title: "Add the write link too, if you made one", body: <>Repeat with the write link and name it <strong>Apex Draft</strong>.</> },
                ]}
              />
              <p>Your link looks like this, with your own key at the end:</p>
              <CodeBlock>{`${AI_CONNECTOR.endpoint}/apx_YOUR_KEY`}</CodeBlock>
            </>
          ),
        },
        {
          id: "test",
          title: "3. Try a first question",
          body: (
            <>
              <p>Start a new chat, type <strong>@</strong>, choose <strong>Apex</strong>, and ask:</p>
              <CodeBlock>{"Which products should I reorder this week?"}</CodeBlock>
              <p>
                Apex marks its reading tools as read-only, so ChatGPT can run them without stopping to ask. Tools that make
                drafts are marked as writes, and ChatGPT asks you to confirm each one, showing what it is about to send.
              </p>
            </>
          ),
        },
        {
          id: "workflow",
          title: "Sorting a new supplier price list",
          body: (
            <>
              <p>A routine that suits ChatGPT, after you have scanned a supplier&rsquo;s price list in Apex Green:</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li><strong>&ldquo;@Apex Show my latest scan for Example Supplier, only products I do not have yet, best ROI first.&rdquo;</strong></li>
                <li><strong>&ldquo;Keep the ones with at least 25% ROI, a sales rank under 50,000 and fewer than 8 sellers.&rdquo;</strong> ChatGPT filters the results it was given.</li>
                <li><strong>&ldquo;Check whether Amazon sells any of these itself.&rdquo;</strong> ChatGPT can look the products up with Apex&rsquo;s product research.</li>
                <li>
                  <strong>&ldquo;@Apex Draft Add the remaining products to my database as drafts at the supplier&rsquo;s cost.&rdquo;</strong>{" "}
                  ChatGPT shows you what it will add and waits for your confirmation (Pro).
                </li>
                <li>Review the new drafts in your Apex database and activate the ones you want.</li>
              </ol>
              <p>Products already in your database under that supplier are skipped and reported, so nothing is duplicated.</p>
            </>
          ),
        },
        {
          id: "trouble",
          title: "Troubleshooting",
          body: (
            <Troubleshooting
              items={[
                ["There is no Add custom MCP server option", <>Your ChatGPT plan or workspace may not allow custom MCP servers, or Developer mode may need turning on in ChatGPT&rsquo;s settings. In a Business or Enterprise workspace, ask your admin. OpenAI&rsquo;s guide has the current requirements.</>],
                ["ChatGPT answers without using Apex", <>Type <strong>@</strong> and choose Apex in the chat, or mention Apex by name in the question.</>],
                ["The connection fails, or Apex answers 401", <>The link was turned off, mistyped or cut short. Make a new link in Apex and create the server again with it.</>],
                ["“This link is read-only. Make a write link in Connect your AI.”", <>Drafts need the write link. Make one on Pro and add it as <strong>Apex Draft</strong>.</>],
                ["“Write access is part of the Pro plan”", <>Drafts are a Pro feature. Reading works on your current plan.</>],
                ["New Apex tools do not show up", <>Open Apex in ChatGPT&rsquo;s Plugins and select <strong>Refresh</strong>, then start a new chat.</>],
                ["“Write limit reached” or “Daily limit reached”", <>You hit the draft limits ({AI_CONNECTOR.limits.writeCallsPerMinutePerKey} a minute, {AI_CONNECTOR.limits.draftsPerDayPerAccount} a day per account). Wait and try again.</>],
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
                <strong>Turn off</strong>. ChatGPT loses access at once. This is the step that matters, because it works
                whatever happens on ChatGPT&rsquo;s side.
              </p>
              <p>
                <strong>In ChatGPT:</strong> open Apex under <strong>Plugins</strong> and remove it. OpenAI&rsquo;s guide does
                not describe this screen, so if you cannot find it, turning the link off in Apex is enough on its own.
              </p>
            </>
          ),
        },
        {
          id: "limits",
          title: "Known limitations",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Web only for setup. Once added, availability in ChatGPT&rsquo;s other apps is up to OpenAI.</li>
              <li>ChatGPT reads what Apex has synced from Amazon, so figures can be a few minutes behind Seller Central.</li>
              <li>It cannot upload a price list or start a scan. Run the scan in Apex Green first.</li>
              <li>Drafts only: no submitting orders, contacting suppliers, spending money, creating shipments or changing live prices.</li>
              <li>The link carries its key, so treat it like a password. OAuth sign-in is planned, not available.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}

export const dynamic = "force-static";
