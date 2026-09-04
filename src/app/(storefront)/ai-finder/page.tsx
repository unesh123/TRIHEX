import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { AIFinderComponent } from "@/components/tools/ai-finder";

export const metadata: Metadata = {
  title: "TRIHEX AI Software Stack Finder — Match Your Goal to AI Tools",
  description:
    "Deterministic recommendation engine matching your workflow (filmmaking, software engineering, deep research, or sales funnels) to verified AI tools in Nepal.",
  alternates: { canonical: "/ai-finder" },
};

export default function AIFinderPage() {
  return (
    <StorefrontPageShell
      title="TRIHEX AI Software Stack Finder"
      description="Select your primary creative or technical objective to discover verified software stacks with direct NPR pricing."
    >
      <AIFinderComponent />
    </StorefrontPageShell>
  );
}
