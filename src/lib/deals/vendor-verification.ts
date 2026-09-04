import { safeFetch } from "@/lib/ingestion/safe-fetch";
import { sanitizeInertText } from "@/lib/ingestion/inert-parser";
import { DealCandidate, DealVerificationReport } from "./types";

export async function verifyVendorDealClaim(candidate: DealCandidate): Promise<{
  updatedCandidate: DealCandidate;
  report: DealVerificationReport;
}> {
  const targetUrl = candidate.officialVendorUrl || candidate.sourceClaimUrl;
  const now = new Date().toISOString();

  // If no URL or invalid URL
  if (!targetUrl || !targetUrl.startsWith("http")) {
    const failedReport: DealVerificationReport = {
      score: 0,
      vendorUrl: targetUrl || "",
      verifiedAt: now,
      isOfficialVendorDomain: false,
      httpStatus: 0,
      claimsMatch: false,
      notes: "No valid vendor URL specified for verification.",
    };

    return {
      updatedCandidate: {
        ...candidate,
        verificationScore: 0,
        verificationReport: failedReport,
        status: "NEEDS_REVIEW",
        lastVerifiedAt: now,
        updatedAt: now,
      },
      report: failedReport,
    };
  }

  let domain = "";
  try {
    domain = new URL(targetUrl).hostname.toLowerCase();
  } catch {
    domain = "";
  }

  // Fetch official page safely
  const fetchResult = await safeFetch<string>(targetUrl, {
    timeoutMs: 6000,
    maxSizeBytes: 1024 * 1024, // 1MB
  });

  if (!fetchResult.ok) {
    const errorReport: DealVerificationReport = {
      score: 15,
      vendorUrl: targetUrl,
      verifiedAt: now,
      isOfficialVendorDomain: domain.length > 0,
      httpStatus: fetchResult.status || 0,
      claimsMatch: false,
      notes: `Failed to contact vendor endpoint: ${fetchResult.error || fetchResult.statusText}`,
    };

    return {
      updatedCandidate: {
        ...candidate,
        verificationScore: 15,
        verificationReport: errorReport,
        status: fetchResult.status === 404 ? "BROKEN" : "NEEDS_REVIEW",
        lastVerifiedAt: now,
        updatedAt: now,
      },
      report: errorReport,
    };
  }

  const rawText = (fetchResult.rawText || "").toLowerCase();
  const vendorLower = candidate.vendor.toLowerCase();
  let score = 40; // Base score for HTTP 200 reachability

  // Vendor name check
  const vendorMatch = rawText.includes(vendorLower);
  if (vendorMatch) score += 20;

  // Deal type keywords check
  const trialKeywords = ["free trial", "start for free", "try free", "no credit card required", "trial period", "credits"];
  const discountKeywords = ["discount", "off", "special offer", "coupon", "promo", "deal"];

  const matchedKeywords: string[] = [];
  for (const kw of [...trialKeywords, ...discountKeywords]) {
    if (rawText.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    score += Math.min(25, matchedKeywords.length * 10);
  }

  // Credit card detection
  const cardDetected = rawText.includes("credit card required") || rawText.includes("payment method required");
  const noCardDetected = rawText.includes("no credit card required") || rawText.includes("no card required");
  const requiresCard = cardDetected && !noCardDetected;

  // Claim match assessment
  const claimsMatch = score >= 65;

  const notes = [
    `Vendor HTTP ${fetchResult.status} OK.`,
    vendorMatch ? `Vendor name "${candidate.vendor}" matched.` : `Vendor name not prominently found in page text.`,
    matchedKeywords.length > 0 ? `Matched keywords: ${matchedKeywords.slice(0, 3).join(", ")}.` : "Few deal keywords detected.",
    requiresCard ? "Vendor specifies credit card required." : "No mandatory credit card requirement detected.",
  ].join(" ");

  // Extract text snippet for admin comparison
  const cleanSnippet = sanitizeInertText(rawText.replace(/\s+/g, " "), 400);

  const report: DealVerificationReport = {
    score: Math.min(100, score),
    vendorUrl: targetUrl,
    verifiedAt: now,
    isOfficialVendorDomain: true,
    httpStatus: fetchResult.status,
    claimsMatch,
    notes,
    detectedVendorTextSnippet: cleanSnippet.slice(0, 300),
    requiresCreditCard: requiresCard,
  };

  const newStatus = score >= 75 ? "VERIFIED" : "NEEDS_REVIEW";

  return {
    updatedCandidate: {
      ...candidate,
      verificationScore: report.score,
      verificationReport: report,
      vendorClaimSummary: notes,
      cardRequired: requiresCard,
      status: newStatus,
      lastVerifiedAt: now,
      updatedAt: now,
    },
    report,
  };
}
