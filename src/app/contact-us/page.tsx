import type { Metadata } from "next";
import ContactUs from "../../components/ContactUs";

export const metadata: Metadata = {
  title: "Contact Us — Apex Applications",
  description: "Get in touch with the Apex Applications team.",
};

export default function Page() {
  return <ContactUs />;
}
