import { Metadata } from "next";
import { getPublishedDeals } from "@/lib/deals/store";
import { DealRadarHub } from "@/components/deals/deal-radar-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Deal Radar · Verified Developer & AI Deals in Nepal",
  description:
    "Discover verified developer software deals, cloud infrastructure credits, student packages, and AI trials. Checked against vendor terms with automatic expiration.",
  openGraph: {
    title: "TRIHEX Deal Radar · Verified Software & AI Deals",
    description: "Verified developer deals, cloud credits, and AI tool trials in Nepal.",
    url: "https://trihexdigital.shop/deals",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/deals",
  },
};

export default function DealsPage() {
  const publishedDeals = getPublishedDeals();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <DealRadarHub initialDeals={publishedDeals} />
    </main>
  );
}
