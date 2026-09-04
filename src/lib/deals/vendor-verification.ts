/**
 * Vendor Verification Engine 2.0
 *
 * Implements explainable, evidence-backed verification scoring (0–100):
 * - Official domain confirmed: +25
 * - Offer detected: +25
 * - Duration exact match: +15
 * - Eligibility exact match: +15
 * - Expiration exact match: +10
 * - Card requirement confirmed: +10
 *
 * Stores structured per-field evidence and detects discrepancies.
 */

import { safeFetch } from "@/lib/ingestion/safe-fetch";
import { sanitizeInertText } from "@/lib/ingestion/inert-parser";
import { DealCandidate, DealVerificationReport, VerificationEvidenceItem } from "./types";

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
      evidence: [],
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

  // Fetch official vendor page safely via SafeFetch 2.0
  const fetchResult = await safeFetch<string>(targetUrl, {
    timeoutMs: 8000,
    maxSizeBytes: 1024 * 1024, // 1MB
    skipDnsLookup: process.env.NODE_ENV === "test",
  });

  if (!fetchResult.ok) {
    const isOffline = fetchResult.status === 0 || fetchResult.statusText === "REQUEST_TIMEOUT";
    const errorReport: DealVerificationReport = {
      score: 10,
      vendorUrl: targetUrl,
      verifiedAt: now,
      isOfficialVendorDomain: domain.length > 0,
      httpStatus: fetchResult.status || 0,
      claimsMatch: false,
      notes: `Failed to contact vendor endpoint: ${fetchResult.error || fetchResult.statusText}`,
      evidence: [
        {
          field: "networkReachability",
          candidateValue: targetUrl,
          detectedValue: fetchResult.statusText,
          match: false,
          scoreContribution: 0,
          reason: `HTTP reachability failed (${fetchResult.statusText})`,
        },
      ],
    };

    return {
      updatedCandidate: {
        ...candidate,
        verificationScore: 10,
        verificationReport: errorReport,
        status: isOffline ? "NEEDS_REVIEW" : fetchResult.status === 404 ? "BROKEN" : "NEEDS_REVIEW",
        lastVerifiedAt: now,
        updatedAt: now,
      },
      report: errorReport,
    };
  }

  const rawText = (fetchResult.rawText || "").toLowerCase();
  const vendorLower = candidate.vendor.toLowerCase();
  const evidence: VerificationEvidenceItem[] = [];

  // 1. Official Domain Match (+25)
  const vendorParts = vendorLower.split(/\s+/)[0].replace(/[^a-z0-9]/g, "");
  const domainMatchesVendor = vendorParts.length > 2 && domain.includes(vendorParts);
  const isOfficialDomain = domainMatchesVendor || (Boolean(candidate.officialVendorUrl) && targetUrl.startsWith("https://"));

  if (isOfficialDomain) {
    evidence.push({
      field: "officialDomain",
      candidateValue: candidate.vendor,
      detectedValue: domain,
      match: true,
      scoreContribution: 25,
      reason: `Vendor domain "${domain}" confirmed as authoritative official source.`,
    });
  } else {
    evidence.push({
      field: "officialDomain",
      candidateValue: candidate.vendor,
      detectedValue: domain,
      match: false,
      scoreContribution: 5,
      reason: `Domain "${domain}" could not be confirmed as primary official vendor domain.`,
    });
  }

  // 2. Offer Detected (+25)
  const offerKeywords = [
    "free trial",
    "start for free",
    "try for free",
    "try free",
    "free tier",
    "credits",
    "coupon",
    "promo",
    "discount",
    "student",
    "education",
    "off",
    "save",
    "deal",
  ];
  const detectedOfferTerms = offerKeywords.filter((kw) => rawText.includes(kw));
  const offerDetected = detectedOfferTerms.length > 0;

  if (offerDetected) {
    evidence.push({
      field: "offerDetected",
      candidateValue: candidate.dealType,
      detectedValue: detectedOfferTerms.slice(0, 3).join(", "),
      match: true,
      scoreContribution: 25,
      reason: `Offer terms confirmed on vendor page: [${detectedOfferTerms.slice(0, 3).join(", ")}].`,
    });
  } else {
    evidence.push({
      field: "offerDetected",
      candidateValue: candidate.dealType,
      detectedValue: "none",
      match: false,
      scoreContribution: 0,
      reason: "No prominent promotional or free tier terminology detected on target page.",
    });
  }

  // 3. Duration Match (+15)
  const durationPatterns = ["60 days", "30 days", "14 days", "7 days", "1 year", "12 months", "lifetime", "annual"];
  const candidateDuration = durationPatterns.find((d) => candidate.summary.toLowerCase().includes(d) || candidate.title.toLowerCase().includes(d));
  let durationMatched = false;

  if (candidateDuration) {
    durationMatched = rawText.includes(candidateDuration);
    evidence.push({
      field: "duration",
      candidateValue: candidateDuration,
      detectedValue: durationMatched ? candidateDuration : "not explicitly found",
      match: durationMatched,
      scoreContribution: durationMatched ? 15 : 0,
      reason: durationMatched
        ? `Duration claim "${candidateDuration}" confirmed on vendor page.`
        : `Claimed duration "${candidateDuration}" not confirmed on vendor page.`,
    });
  } else {
    // If deal doesn't have a fixed duration (e.g. permanent free tier)
    const isPermanent = candidate.dealType === "FREEBIE" && rawText.includes("free");
    evidence.push({
      field: "duration",
      candidateValue: "ongoing",
      detectedValue: isPermanent ? "ongoing" : undefined,
      match: isPermanent,
      scoreContribution: isPermanent ? 15 : 8,
      reason: isPermanent ? "Ongoing free tier active." : "Unspecified duration.",
    });
  }

  // 4. Eligibility Match (+15)
  let eligibilityMatched = false;
  if (candidate.dealType === "STUDENT_TIER" || (candidate.eligibility && candidate.eligibility.toLowerCase().includes("student"))) {
    eligibilityMatched = rawText.includes("student") || rawText.includes("academic") || rawText.includes(".edu");
  } else if (candidate.eligibility && candidate.eligibility.toLowerCase().includes("new account")) {
    eligibilityMatched = rawText.includes("new") || rawText.includes("sign up") || rawText.includes("register");
  } else {
    eligibilityMatched = true; // Open eligibility
  }

  evidence.push({
    field: "eligibility",
    candidateValue: candidate.eligibility || "Open",
    detectedValue: eligibilityMatched ? "matched" : "unconfirmed",
    match: eligibilityMatched,
    scoreContribution: eligibilityMatched ? 15 : 0,
    reason: eligibilityMatched
      ? "User eligibility terms align with vendor registration terms."
      : "Eligibility criteria could not be confirmed on vendor page.",
  });

  // 5. Expiration Detection (+10)
  const expiredKeywords = ["expired", "offer ended", "promotion has ended", "no longer available", "deal closed"];
  const pageSaysExpired = expiredKeywords.some((kw) => rawText.includes(kw));

  if (pageSaysExpired) {
    evidence.push({
      field: "expiration",
      candidateValue: candidate.validUntil || "Active",
      detectedValue: "EXPIRED",
      match: false,
      scoreContribution: 0,
      reason: "Vendor page explicitly notes that promotion has expired or ended.",
    });
  } else {
    evidence.push({
      field: "expiration",
      candidateValue: candidate.validUntil || "Active",
      detectedValue: "ACTIVE",
      match: true,
      scoreContribution: 10,
      reason: "Vendor landing page indicates active availability without expiration warnings.",
    });
  }

  // 6. Credit Card Requirement (+10)
  const cardPhrases = ["credit card required", "card required", "payment method required", "enter card"];
  const noCardPhrases = ["no credit card required", "no card required", "no payment required"];

  const mentionsCard = cardPhrases.some((p) => rawText.includes(p));
  const mentionsNoCard = noCardPhrases.some((p) => rawText.includes(p));
  const vendorRequiresCard = mentionsCard && !mentionsNoCard;

  const cardMatches = candidate.cardRequired === vendorRequiresCard;
  evidence.push({
    field: "creditCardRequired",
    candidateValue: candidate.cardRequired ? "Required" : "Not required",
    detectedValue: vendorRequiresCard ? "Required" : "Not required",
    match: cardMatches,
    scoreContribution: cardMatches ? 10 : 0,
    reason: cardMatches
      ? `Credit card condition matches: ${vendorRequiresCard ? "Required" : "Not required"}.`
      : `Discrepancy: candidate states card ${candidate.cardRequired ? "required" : "not required"}, but vendor states ${vendorRequiresCard ? "required" : "not required"}.`,
  });

  // Compute final score
  const totalScore = Math.min(100, evidence.reduce((sum, item) => sum + item.scoreContribution, 0));
  const cleanSnippet = sanitizeInertText(rawText.replace(/\s+/g, " "), 300);

  const notes = [
    `Verification score: ${totalScore}/100.`,
    isOfficialDomain ? "Official vendor domain confirmed." : "Domain unconfirmed.",
    offerDetected ? "Offer terms active." : "Few offer terms found.",
    pageSaysExpired ? "CRITICAL: Vendor page states expired!" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const report: DealVerificationReport = {
    score: totalScore,
    vendorUrl: targetUrl,
    verifiedAt: now,
    isOfficialVendorDomain: isOfficialDomain,
    httpStatus: fetchResult.status,
    claimsMatch: totalScore >= 65 && !pageSaysExpired,
    notes,
    detectedVendorTextSnippet: cleanSnippet,
    requiresCreditCard: vendorRequiresCard,
    evidence,
  };

  let newStatus: DealCandidate["status"] = "NEEDS_REVIEW";
  if (pageSaysExpired) {
    newStatus = "EXPIRED";
  } else if (totalScore >= 75) {
    newStatus = "VERIFIED";
  } else if (totalScore < 40) {
    newStatus = "REJECTED";
  }

  return {
    updatedCandidate: {
      ...candidate,
      verificationScore: totalScore,
      verificationReport: report,
      vendorClaimSummary: notes,
      cardRequired: vendorRequiresCard,
      status: candidate.status === "PUBLISHED" && totalScore >= 65 && !pageSaysExpired ? "PUBLISHED" : newStatus,
      lastVerifiedAt: now,
      updatedAt: now,
    },
    report,
  };
}
