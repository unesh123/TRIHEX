import { describe, it, expect } from "vitest";
import {
  fetchNepalSeismicFeed,
  fetchNepalSeismicEvents,
  calculateDistanceFromKathmanduKm,
} from "@/lib/nepal/earthquake-adapter";
import { fetchNepalAirQualityFeed } from "@/lib/nepal/air-quality-adapter";
import { fetchNepalEconomicFeed } from "@/lib/nepal/macroeconomic-adapter";
import { fetchNrbForexFeed } from "@/lib/nepal/nrb-forex-adapter";
import { fetchOpenDataFeed } from "@/lib/nepal/open-data-adapter";

describe("Nepal Intelligence Center 2.0 Civic Feeds & Geodetic Engine", () => {
  it("calculates accurate geodesic distance from Kathmandu using Haversine formula", () => {
    // Kathmandu to Pokhara (approx 145-150 km geodesic)
    const ktmToPokhara = calculateDistanceFromKathmanduKm(28.209, 83.959);
    expect(ktmToPokhara).toBeGreaterThan(130);
    expect(ktmToPokhara).toBeLessThan(165);

    // Kathmandu to Jajarkot (approx 307 km geodesic as the crow flies)
    const ktmToJajarkot = calculateDistanceFromKathmanduKm(28.784, 82.428);
    expect(ktmToJajarkot).toBeGreaterThan(290);
    expect(ktmToJajarkot).toBeLessThan(330);

    // Kathmandu to Kathmandu center is ~0 km
    const ktmSelf = calculateDistanceFromKathmanduKm(27.7172, 85.3240);
    expect(ktmSelf).toBe(0);
  });

  it("seismic feed returns standardized NepalFeedResult with enriched event distances", async () => {
    const feed = await fetchNepalSeismicFeed();
    expect(feed).toBeDefined();
    expect(["LIVE", "CACHED", "STALE"]).toContain(feed.status);
    expect(feed.sourceName).toBeTruthy();
    expect(feed.data.events.length).toBeGreaterThan(0);

    for (const event of feed.data.events) {
      expect(event.magnitude).toBeGreaterThanOrEqual(2.0);
      expect(event.depthKm).toBeGreaterThanOrEqual(0);
      expect(event.latitude).toBeGreaterThan(25);
      expect(event.latitude).toBeLessThan(32);
      expect(event.longitude).toBeGreaterThan(79);
      expect(event.longitude).toBeLessThan(90);
      expect(event.distanceFromKathmanduKm).toBeDefined();
      expect(event.distanceFromKathmanduKm).toBeGreaterThanOrEqual(0);
    }
  });

  it("air quality feed returns verified stations with valid AQI and PM2.5 metrics", async () => {
    const feed = await fetchNepalAirQualityFeed();
    expect(feed).toBeDefined();
    expect(["LIVE", "CACHED", "STALE"]).toContain(feed.status);
    expect(feed.data.stations.length).toBeGreaterThanOrEqual(4);
    expect(feed.data.nationalAverageAqi).toBeGreaterThan(0);
    expect(feed.data.advisoryText).toBeTruthy();

    const ktm = feed.data.stations.find((s) => s.city.toLowerCase().includes("kathmandu"));
    expect(ktm).toBeDefined();
    expect(ktm?.pm25).toBeGreaterThan(0);
    expect(ktm?.dominantPollutant).toBe("PM2.5");
  });

  it("macroeconomic feed returns verified remittance, reserves, and inflation metrics", async () => {
    const feed = await fetchNepalEconomicFeed();
    expect(feed).toBeDefined();
    expect(feed.data.length).toBeGreaterThanOrEqual(4);

    const remittance = feed.data.find((i) => i.category === "REMITTANCE");
    expect(remittance).toBeDefined();
    expect(remittance?.value).toContain("Billion");

    const reserves = feed.data.find((i) => i.category === "FOREX_RESERVES");
    expect(reserves).toBeDefined();
    expect(reserves?.value).toContain("USD");
  });

  it("NRB forex feed returns standardized NepalFeedResult wrapper", async () => {
    const feed = await fetchNrbForexFeed();
    expect(feed).toBeDefined();
    expect(["LIVE", "CACHED", "STALE"]).toContain(feed.status);
    expect(feed.data.rates.length).toBeGreaterThan(5);
    expect(feed.sourceUrl).toContain("nrb.org.np");
  });

  it("open data feed returns public datasets with valid schemas", async () => {
    const feed = await fetchOpenDataFeed();
    expect(feed).toBeDefined();
    expect(feed.data.length).toBeGreaterThanOrEqual(5);

    for (const ds of feed.data) {
      expect(ds.title).toBeTruthy();
      expect(ds.organization).toBeTruthy();
      expect(ds.category).toBeTruthy();
    }
  });
});
