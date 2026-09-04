import { Citation } from "./types";

const TRUSTED_NEPAL_DOMAINS = [
  "nrb.org.np",
  "gov.np",
  "nso.gov.np",
  "mof.gov.np",
  "nea.org.np",
  "opendatanepal.com",
  "earthquake.usgs.gov",
  "usgs.gov",
  "openaq.org",
  "worldbank.org",
  "imf.org",
  "adb.org",
];

export function validateCitation(citation: Citation): Citation {
  let isVerified = false;

  try {
    const parsed = new URL(citation.url);
    const hostname = parsed.hostname.toLowerCase();

    isVerified = TRUSTED_NEPAL_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch {
    isVerified = false;
  }

  return {
    ...citation,
    isVerifiedSource: isVerified,
  };
}

export function computeReportConfidence(
  citations: Citation[],
  structuredDataUsedCount: number
): number {
  if (structuredDataUsedCount === 0 && citations.length === 0) return 30;

  // Base score starting from ground truth inputs
  let score = 50;

  // Each verified structured source adds +15 (up to +30)
  score += Math.min(30, structuredDataUsedCount * 15);

  // Each verified external citation adds +5 (up to +20)
  const verifiedCitations = citations.filter((c) => c.isVerifiedSource).length;
  score += Math.min(20, verifiedCitations * 5);

  return Math.min(100, Math.max(10, score));
}
