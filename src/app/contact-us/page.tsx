import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ContactUs from "../../components/ContactUs";

export const metadata: Metadata = pageMetadata({
  title: "Contact Apex Applications | Amazon Seller Software",
  description:
    "Questions about Apex, your account, or partnering with us? Get in touch with the Apex Applications team and send us a message. We will get back to you.",
  path: "/contact-us",
});

export default function Page() {
  return <ContactUs />;
}
