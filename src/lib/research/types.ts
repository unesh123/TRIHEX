/**
 * TRIHEX Evidence-Backed Nepal Deep Research Engine Types
 */

export type ResearchTopicCategory =
  | "ECONOMY"
  | "FOREX"
  | "SEISMOLOGY"
  | "CIVIC_DATA"
  | "TECHNOLOGY"
  | "GENERAL";

export interface Citation {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedDate?: string;
  snippet: string;
  isVerifiedSource: boolean;
}

export interface EvidenceClaim {
  claim: string;
  status: "VERIFIED_STRUCTURED" | "VERIFIED_EXTERNAL" | "UNVERIFIED" | "DISPUTED";
  groundTruthValue?: string;
  citationIds: string[];
}

export interface ResearchFinding {
  heading: string;
  summary: string;
  claims: EvidenceClaim[];
}

export interface ResearchPlan {
  query: string;
  detectedCategory: ResearchTopicCategory;
  requiresStructuredForex: boolean;
  requiresStructuredSeismic: boolean;
  requiresStructuredEconomy: boolean;
  requiresStructuredDatasets: boolean;
  searchKeywords: string[];
}

export type ConfidenceTier = "Strong" | "Good" | "Mixed" | "Limited";

export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Mixed";
  return "Limited";
}

export interface EvidenceReport {
  id: string;
  query: string;
  category: ResearchTopicCategory;
  executiveSummary: string;
  confidenceScore: number; // 0 - 100
  confidenceTier: ConfidenceTier;
  findings: ResearchFinding[];
  citations: Citation[];
  groundTruthSourcesUsed: string[];
  generatedAt: string;
  providerUsed: string;
  latencyMs: number;
}
