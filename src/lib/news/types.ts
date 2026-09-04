export type NewsCategory = 
  | "NEPAL_TECH" 
  | "AI_GLOBAL" 
  | "ECONOMIC_POLICY" 
  | "CIVIC_INFRASTRUCTURE";

export interface GeoNewsCoordinates {
  lat: number;
  lng: number;
  locationName: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: NewsCategory;
  excerpt: string;
  bulletPoints: string[];
  hotScore: number; // 0 to 100
  geoCoordinates?: GeoNewsCoordinates;
  tags: string[];
  isPinned?: boolean;
  readTimeMinutes: number;
}

export interface NewsFilterOptions {
  category?: NewsCategory | "ALL";
  query?: string;
  minHotScore?: number;
}
