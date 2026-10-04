import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import PrivacyPolicy from "../../components/PrivacyPolicy";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | Apex Applications",
  description:
    "How Apex Applications collects, uses, and protects your data, including SMS communications and mobile information practices, in our full privacy policy.",
  path: "/privacy",
});

export default function Page() {
  return <PrivacyPolicy />;
}
