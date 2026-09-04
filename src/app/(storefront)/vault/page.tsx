import type { Metadata } from "next";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { UnifiedVaultHub } from "@/components/vault/unified-vault-hub";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";

export const metadata: Metadata = {
  title: "TRIHEX VAULT — Premium Resources, Verified Deals, Developer Perks & Research",
  description:
    "Flagship intelligence & discovery hub for Nepal: Premium software bundles, verified vendor deals, free cloud credits, prompt engineering toolkits, and public records.",
  openGraph: {
    title: "TRIHEX VAULT — Premium Resources • Verified Deals • Developer Perks",
    description:
      "One destination for premium tools, verified software deals, free developer perks, and evidence-backed research.",
    url: "https://trihexdigital.shop/vault",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/vault",
  },
};

export const dynamic = "force-dynamic";

export default function VaultPage() {
  const entries = getAllVaultEntries();

  return (
    <StorefrontPageShell
      title="TRIHEX VAULT"
      description="Nepal's unified intelligence & discovery center: Verified vendor software deals, VIP toolkits, free developer credits, AI prompt packs, and public records."
    >
      <UnifiedVaultHub initialEntries={entries} />
    </StorefrontPageShell>
  );
}
