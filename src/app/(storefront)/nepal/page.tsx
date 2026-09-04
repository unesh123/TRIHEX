import { Metadata } from "next";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";
import { fetchNepalSeismicEvents } from "@/lib/nepal/earthquake-adapter";
import { getOpenDatasets } from "@/lib/nepal/open-data-adapter";
import { NepalPulseHub } from "@/components/nepal/nepal-pulse-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Nepal Pulse · Real-Time NRB Forex, Seismic Monitor & Civic Data",
  description:
    "Official Nepal Rastra Bank foreign exchange rates with live NPR converter, real-time USGS seismic event feed for Nepal, and verified open datasets.",
  openGraph: {
    title: "TRIHEX Nepal Pulse · Real-Time Civic & Economic Feeds",
    description: "Live NRB forex rates, USGS Nepal earthquake monitor, and verified open datasets.",
    url: "https://trihexdigital.shop/nepal",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/nepal",
  },
};

export default async function NepalPulsePage() {
  const [forex, seismic] = await Promise.all([
    fetchNrbForexRates(),
    fetchNepalSeismicEvents(),
  ]);

  const datasets = getOpenDatasets();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <NepalPulseHub forex={forex} seismic={seismic} datasets={datasets} />
    </main>
  );
}
