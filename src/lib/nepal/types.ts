/**
 * TRIHEX Nepal Civic & Geodetic Intelligence Data Types
 * Standardized across all Nepal civic feeds (Forex, Seismic, Open Datasets, Air Quality)
 */

export type NepalFeedFreshness = "LIVE" | "CACHED" | "STALE" | "UNAVAILABLE";

export interface NepalFeedResult<T> {
  status: NepalFeedFreshness;
  data: T;
  sourceName: string;
  sourceUrl: string;
  sourceTimestamp?: string;
  fetchedAt: string;
  expiresAt?: string;
  notice?: string;
  latencyMs?: number;
}

export interface AirQualityStation {
  city: string;
  stationName: string;
  aqi: number;
  pm25: number; // ug/m3
  status: "GOOD" | "MODERATE" | "UNHEALTHY_SENSITIVE" | "UNHEALTHY" | "VERY_UNHEALTHY" | "HAZARDOUS";
  dominantPollutant: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

export interface AirQualitySnapshot {
  stations: AirQualityStation[];
  nationalAverageAqi: number;
  advisoryText: string;
}

export interface EconomicIndicator {
  code: string;
  title: string;
  category: "REMITTANCE" | "FOREX_RESERVES" | "INFLATION" | "POLICY_RATE";
  value: string;
  unit: string;
  period: string;
  changeDelta?: string;
  trend: "UP" | "DOWN" | "STABLE";
  source: string;
  sourceUrl: string;
}
