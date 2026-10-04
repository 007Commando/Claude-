import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import TermsOfService from "../../components/TermsOfService";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | Apex Applications",
  description:
    "The terms of service governing your use of the Apex Applications Amazon wholesale software suite. Read them before you create an account or start a trial.",
  path: "/terms",
});

export default function Page() {
  return <TermsOfService />;
}
