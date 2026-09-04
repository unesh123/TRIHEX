import { Metadata } from "next";
import { fetchNepalSeismicEvents } from "@/lib/nepal/earthquake-adapter";
import { getOpenDatasets } from "@/lib/nepal/open-data-adapter";
import { TrihexMap } from "@/components/maps/trihex-map";
import { MapPin, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interactive Nepal Map · Earthquakes, Open Datasets & Service Hubs",
  description:
    "Explore real-time Nepal seismic events, civic open datasets, and TRIHEX digital service hubs on an interactive high-precision map.",
  openGraph: {
    title: "Interactive Nepal Map · TRIHEX DIGITAL",
    description: "Real-time Nepal earthquakes, civic open datasets, and service hubs.",
    url: "https://trihexdigital.shop/map",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/map",
  },
};

export default async function MapPage() {
  const [seismic, datasets] = await Promise.all([
    fetchNepalSeismicEvents(),
    Promise.resolve(getOpenDatasets()),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <MapPin className="w-3.5 h-3.5" />
            Google Maps Platform · Nepal Geodetic Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Nepal Interactive Geospatial Explorer
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Toggle layers for real-time seismic epicenters, open government civic data nodes, and regional TRIHEX digital service operations.
          </p>
        </div>

        <TrihexMap earthquakes={seismic.events} datasets={datasets} />
      </div>
    </main>
  );
}
