import type { Metadata } from "next";
import { Suspense } from "react";
import PopQualify from "../../../components/PopQualify";

export const metadata: Metadata = {
  title: "Apex POP: Start Here",
  description:
    "Three quick questions so your free demo and setup fits where you are, then your free Apex account.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PopQualify />
    </Suspense>
  );
}
