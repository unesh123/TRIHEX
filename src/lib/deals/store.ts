import { DealCandidate, DealApprovalType } from "./types";

// High-quality verified seed deals for developers and creators
const INITIAL_DEAL_CANDIDATES: DealCandidate[] = [
  {
    id: "deal-digitalocean-credits",
    sourceId: "src-resourify-deals",
    sourceExternalId: "do-200-credits",
    title: "DigitalOcean $200 Cloud Credits for 60 Days",
    slug: "digitalocean-200-credits",
    vendor: "DigitalOcean",
    summary: "Get $200 in cloud infrastructure credits valid for 60 days. Deploy Droplets, Kubernetes, Managed PostgreSQL, and App Platform instances.",
    dealType: "CREDITS",
    detectedValueNprMinor: 2700000, // NPR 27,000 value
    promoCode: "DO-FREE-200",
    eligibility: "New DigitalOcean accounts only with verified email and payment method",
    cardRequired: true,
    sourceClaimUrl: "https://resourify.com/deal/digitalocean-200",
    officialVendorUrl: "https://www.digitalocean.com/try/free-trial",
    discoveredAt: "2026-03-01T10:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    lastVerifiedAt: "2026-09-04T08:00:00Z",
    verificationScore: 95,
    vendorClaimSummary: "Vendor HTTP 200 OK. Vendor name DigitalOcean matched. Official promo active.",
    status: "PUBLISHED",
    approvalType: "FREE",
    revisions: [],
    category: "CLOUD",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-09-04T08:00:00Z",
  },
  {
    id: "deal-github-student-pack",
    sourceId: "src-resourify-deals",
    sourceExternalId: "gh-student-pack",
    title: "GitHub Student Developer Pack (Free Copilot & Tools)",
    slug: "github-student-developer-pack",
    vendor: "GitHub & Partners",
    summary: "Comprehensive bundle for verified students: free GitHub Copilot Pro access, JetBrains IDE licenses, Namecheap free .me domain, 1Password, and Stripe waiver.",
    dealType: "STUDENT_TIER",
    detectedValueNprMinor: 20000000, // NPR 200,000 estimated suite value
    eligibility: "Enrolled students worldwide with verified academic email or student ID",
    cardRequired: false,
    sourceClaimUrl: "https://resourify.com/deal/github-student-pack",
    officialVendorUrl: "https://education.github.com/pack",
    discoveredAt: "2026-02-15T12:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    lastVerifiedAt: "2026-09-04T09:30:00Z",
    verificationScore: 98,
    vendorClaimSummary: "Vendor HTTP 200 OK. GitHub Education program verified and active.",
    status: "PUBLISHED",
    approvalType: "FREE",
    revisions: [],
    category: "EDUCATION",
    createdAt: "2026-02-15T12:00:00Z",
    updatedAt: "2026-09-04T09:30:00Z",
  },
  {
    id: "deal-supabase-pro-credits",
    sourceId: "src-resourify-deals",
    sourceExternalId: "sb-launch-credits",
    title: "Supabase Startup & Builder Tier (100k Monthly Auth + 8GB DB)",
    slug: "supabase-builder-tier",
    vendor: "Supabase",
    summary: "Generous free tier featuring 500MB database, 1GB storage, 50,000 monthly active users, and unlimited API requests for early developers.",
    dealType: "FREEBIE",
    detectedValueNprMinor: 350000, // NPR 3,500 value
    eligibility: "Open to all developers",
    cardRequired: false,
    sourceClaimUrl: "https://resourify.com/deal/supabase-free",
    officialVendorUrl: "https://supabase.com/pricing",
    discoveredAt: "2026-02-20T08:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    lastVerifiedAt: "2026-09-03T14:00:00Z",
    verificationScore: 92,
    vendorClaimSummary: "Vendor pricing page verified. Free tier requires no credit card.",
    status: "PUBLISHED",
    approvalType: "FREE",
    revisions: [],
    category: "INFRASTRUCTURE",
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-09-03T14:00:00Z",
  },
  {
    id: "deal-cloudflare-workers-free",
    sourceId: "src-resourify-deals",
    sourceExternalId: "cf-workers-free",
    title: "Cloudflare Workers: 100,000 Requests/Day Free Tier",
    slug: "cloudflare-workers-free-tier",
    vendor: "Cloudflare",
    summary: "Serverless edge compute with zero cold starts, 10ms CPU time per invocation, KV storage, and Vectorize AI embeddings support on the global edge.",
    dealType: "FREEBIE",
    detectedValueNprMinor: 150000,
    eligibility: "All registered Cloudflare accounts",
    cardRequired: false,
    sourceClaimUrl: "https://resourify.com/deal/cloudflare-workers",
    officialVendorUrl: "https://workers.cloudflare.com",
    discoveredAt: "2026-01-10T11:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    lastVerifiedAt: "2026-09-02T10:00:00Z",
    verificationScore: 94,
    vendorClaimSummary: "Vendor official page verified. Permanent free tier active.",
    status: "PUBLISHED",
    approvalType: "FREE",
    revisions: [],
    category: "AI_DEV",
    createdAt: "2026-01-10T11:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "deal-perplexity-pro-telecom",
    sourceId: "src-resourify-deals",
    sourceExternalId: "pplx-annual-partner",
    title: "Perplexity Pro 1-Year Free via Partner Verification",
    slug: "perplexity-pro-annual-offer",
    vendor: "Perplexity AI",
    summary: "Full access to Claude 3.7 Sonnet, GPT-4o, Sonar Reasoning models, unlimited file uploads, and Deep Research reports.",
    dealType: "DISCOUNT",
    detectedValueNprMinor: 2700000,
    promoCode: "STUDENT2026",
    eligibility: "Qualified student or select telecom partner subscribers",
    cardRequired: true,
    sourceClaimUrl: "https://resourify.com/deal/perplexity-pro-free",
    officialVendorUrl: "https://www.perplexity.ai/pro",
    discoveredAt: "2026-08-25T14:00:00Z",
    validUntil: "2026-10-31T23:59:59Z",
    lastVerifiedAt: "2026-09-03T11:00:00Z",
    verificationScore: 82,
    vendorClaimSummary: "Vendor site verified. Partner eligibility requires verification at signup.",
    status: "APPROVED",
    approvalType: "FREE",
    revisions: [],
    category: "AI_DEV",
    createdAt: "2026-08-25T14:00:00Z",
    updatedAt: "2026-09-03T11:00:00Z",
  },
  {
    id: "deal-cursor-pro-candidate",
    sourceId: "src-resourify-deals",
    sourceExternalId: "cursor-two-week-trial",
    title: "Cursor IDE Pro: 14-Day Full AI Feature Trial",
    slug: "cursor-ide-pro-trial",
    vendor: "Anysphere (Cursor)",
    summary: "Two-week unmetered trial of Agent mode, Composer multi-file editing, codebase indexing, and premium fast model requests.",
    dealType: "FREE_TRIAL",
    detectedValueNprMinor: 270000,
    eligibility: "New Cursor user registrations",
    cardRequired: false,
    sourceClaimUrl: "https://resourify.com/deal/cursor-trial",
    officialVendorUrl: "https://www.cursor.com/pricing",
    discoveredAt: "2026-09-01T09:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    lastVerifiedAt: "2026-09-04T12:00:00Z",
    verificationScore: 91,
    vendorClaimSummary: "Vendor pricing confirms 14-day trial for new accounts.",
    status: "VERIFIED",
    revisions: [],
    category: "AI_DEV",
    createdAt: "2026-09-01T09:00:00Z",
    updatedAt: "2026-09-04T12:00:00Z",
  },
  {
    id: "deal-pcloud-lifetime-radar",
    sourceId: "src-resourify-deals",
    sourceExternalId: "pcloud-flash-2tb",
    title: "pCloud 2TB Lifetime Flash Promotion (Expired)",
    slug: "pcloud-2tb-flash-deal",
    vendor: "pCloud AG",
    summary: "One-time payment lifetime cloud storage promo with client-side encryption.",
    dealType: "DISCOUNT",
    detectedValueNprMinor: 3990000,
    sourceClaimUrl: "https://resourify.com/deal/pcloud-2tb",
    officialVendorUrl: "https://www.pcloud.com/promo",
    discoveredAt: "2026-08-01T00:00:00Z",
    validUntil: "2026-08-20T23:59:59Z", // Past date
    lastVerifiedAt: "2026-08-21T00:00:00Z",
    verificationScore: 40,
    vendorClaimSummary: "Vendor official promo page has expired.",
    status: "EXPIRED",
    approvalType: "FREE",
    revisions: [],
    cardRequired: true,
    category: "CLOUD",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-21T00:00:00Z",
  },
];

let dealsStore: DealCandidate[] = [...INITIAL_DEAL_CANDIDATES];

export function getAllDealCandidates(): DealCandidate[] {
  // Run passive expiration check on query
  checkDealExpirations();
  return [...dealsStore];
}

export function getDealCandidateBySlug(slug: string): DealCandidate | undefined {
  return dealsStore.find((d) => d.slug === slug);
}

export function getPublishedDeals(filter?: {
  category?: DealCandidate["category"];
  dealType?: DealCandidate["dealType"];
}): DealCandidate[] {
  checkDealExpirations();
  return dealsStore.filter((deal) => {
    // Only PUBLISHED deals show on public storefront
    if (deal.status !== "PUBLISHED") return false;
    if (filter?.category && deal.category !== filter.category) return false;
    if (filter?.dealType && deal.dealType !== filter.dealType) return false;
    return true;
  });
}

export function approveDeal(
  candidateId: string,
  approvalType: DealApprovalType,
  adminUser = "admin",
  assignedProductId?: string
): DealCandidate | null {
  const index = dealsStore.findIndex((d) => d.id === candidateId);
  if (index === -1) return null;

  const candidate = dealsStore[index];
  const now = new Date().toISOString();

  const revision = {
    id: `rev-${Date.now()}`,
    candidateId,
    field: "status",
    oldValue: candidate.status,
    newValue: "PUBLISHED",
    changedBy: adminUser,
    reason: `Approved as ${approvalType} deal${assignedProductId ? ` linked to product ${assignedProductId}` : ""}`,
    createdAt: now,
  };

  const updated: DealCandidate = {
    ...candidate,
    status: "PUBLISHED",
    approvalType,
    assignedProductId,
    revisions: [revision, ...candidate.revisions],
    updatedAt: now,
  };

  dealsStore[index] = updated;
  return updated;
}

export function rejectDeal(
  candidateId: string,
  reason: string,
  adminUser = "admin"
): DealCandidate | null {
  const index = dealsStore.findIndex((d) => d.id === candidateId);
  if (index === -1) return null;

  const candidate = dealsStore[index];
  const now = new Date().toISOString();

  const revision = {
    id: `rev-${Date.now()}`,
    candidateId,
    field: "status",
    oldValue: candidate.status,
    newValue: "REJECTED",
    changedBy: adminUser,
    reason,
    createdAt: now,
  };

  const updated: DealCandidate = {
    ...candidate,
    status: "REJECTED",
    revisions: [revision, ...candidate.revisions],
    updatedAt: now,
  };

  dealsStore[index] = updated;
  return updated;
}

export function updateDeal(
  candidateId: string,
  updates: Partial<DealCandidate>,
  adminUser = "admin"
): DealCandidate | null {
  const index = dealsStore.findIndex((d) => d.id === candidateId);
  if (index === -1) return null;

  const candidate = dealsStore[index];
  const now = new Date().toISOString();

  const revisions = [...candidate.revisions];
  for (const [key, value] of Object.entries(updates)) {
    if ((candidate as any)[key] !== value) {
      revisions.unshift({
        id: `rev-${Date.now()}-${key}`,
        candidateId,
        field: key,
        oldValue: (candidate as any)[key],
        newValue: value as any,
        changedBy: adminUser,
        createdAt: now,
      });
    }
  }

  const updated: DealCandidate = {
    ...candidate,
    ...updates,
    revisions,
    updatedAt: now,
  };

  dealsStore[index] = updated;
  return updated;
}

export function addDealCandidate(candidate: DealCandidate): DealCandidate {
  dealsStore.unshift(candidate);
  return candidate;
}

export function checkDealExpirations(): { expiredCount: number; expiringSoonCount: number } {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  let expiredCount = 0;
  let expiringSoonCount = 0;

  for (let i = 0; i < dealsStore.length; i++) {
    const deal = dealsStore[i];
    if (!deal.validUntil) continue;

    const expiry = new Date(deal.validUntil);
    if (isNaN(expiry.getTime())) continue;

    if (expiry < now && deal.status === "PUBLISHED") {
      dealsStore[i] = {
        ...deal,
        status: "EXPIRED",
        updatedAt: now.toISOString(),
      };
      expiredCount++;
    } else if (expiry <= threeDaysFromNow && expiry > now && deal.status === "PUBLISHED") {
      expiringSoonCount++;
    }
  }

  return { expiredCount, expiringSoonCount };
}
