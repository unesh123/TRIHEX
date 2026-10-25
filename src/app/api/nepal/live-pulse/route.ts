import { NextResponse } from "next/server";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";
import { fetchNepalSeismicEvents } from "@/lib/nepal/earthquake-adapter";
import { fetchNepalAirQualityFeed } from "@/lib/nepal/air-quality-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [forex, seismic, aqi] = await Promise.all([
      fetchNrbForexRates(),
      fetchNepalSeismicEvents(),
      fetchNepalAirQualityFeed(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: "LIVE_24_7",
      radarActive: true,
      forex: {
        date: forex.date,
        publishedAt: forex.publishedAt,
        rates: forex.rates,
        isLive: forex.isLive,
      },
      seismic: {
        events: seismic.events.slice(0, 5),
        count: seismic.events.length,
        isLive: seismic.isLive,
      },
      airQuality: {
        stations: aqi.data?.stations ?? [],
        isLive: aqi.status === "LIVE",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load live pulse data" },
      { status: 500 }
    );
  }
}
