import { DealCandidate, DealApprovalType, DealRevision, DealType } from "./types";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Initial seed deals for bootstrapping
export const INITIAL_DEAL_CANDIDATES: DealCandidate[] = [
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
    currency: "NPR",
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
    saleRightsStatus: "FREE_LINK_ONLY",
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
    currency: "NPR",
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
    saleRightsStatus: "FREE_LINK_ONLY",
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
    currency: "NPR",
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
    saleRightsStatus: "FREE_LINK_ONLY",
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
    currency: "NPR",
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
    saleRightsStatus: "FREE_LINK_ONLY",
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
    currency: "NPR",
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
    saleRightsStatus: "FREE_LINK_ONLY",
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
    currency: "NPR",
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
    saleRightsStatus: "FREE_LINK_ONLY",
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
    currency: "NPR",
    sourceClaimUrl: "https://resourify.com/deal/pcloud-2tb",
    officialVendorUrl: "https://www.pcloud.com/promo",
    discoveredAt: "2026-08-01T00:00:00Z",
    validUntil: "2026-08-20T23:59:59Z", // Past date
    lastVerifiedAt: "2026-08-21T00:00:00Z",
    verificationScore: 40,
    vendorClaimSummary: "Vendor official promo page has expired.",
    status: "EXPIRED",
    approvalType: "FREE",
    saleRightsStatus: "FREE_LINK_ONLY",
    revisions: [],
    cardRequired: true,
    category: "CLOUD",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-21T00:00:00Z",
  },
];

// In-memory mirror for low-latency synchronous reads
let dealsStore: DealCandidate[] = [...INITIAL_DEAL_CANDIDATES];
let dbSyncInitialized = false;

function mapDbRowToCandidate(row: typeof schema.dealCandidates.$inferSelect, revisions: DealRevision[] = []): DealCandidate {
  return {
    id: row.id,
    sourceId: row.sourceId || "src-resourify-deals",
    sourceExternalId: row.externalId || undefined,
    title: row.title,
    slug: row.slug,
    vendor: row.vendor,
    summary: row.summary,
    dealType: row.dealType as DealType,
    detectedValueNprMinor: row.detectedValueNprMinor || undefined,
    currency: row.currency,
    promoCode: row.promoCode || undefined,
    eligibility: row.eligibility || undefined,
    cardRequired: row.cardRequired,
    sourceClaimUrl: row.sourceClaimUrl,
    officialVendorUrl: row.officialVendorUrl,
    discoveredAt: row.createdAt.toISOString(),
    validFrom: row.validFrom ? row.validFrom.toISOString() : undefined,
    validUntil: row.validUntil ? row.validUntil.toISOString() : undefined,
    lastVerifiedAt: row.lastVerifiedAt ? row.lastVerifiedAt.toISOString() : undefined,
    verificationScore: row.verificationScore,
    verificationReport: row.verificationReport as any,
    vendorClaimSummary: row.vendorClaimSummary || undefined,
    status: row.status as any,
    approvalType: row.approvalType as any,
    saleRightsStatus: (row.saleRightsStatus || "FREE_LINK_ONLY") as any,
    assignedProductId: row.assignedProductId || undefined,
    revisions,
    category: row.category as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Ensures PostgreSQL tables have initial deals seeded and syncs the in-memory cache
 */
export async function syncDealsFromDatabase(): Promise<DealCandidate[]> {
  const db = getDb();
  if (!db) {
    dbSyncInitialized = true;
    return dealsStore;
  }

  try {
    const existing = await db.select().from(schema.dealCandidates);

    // If database has no candidates yet, seed initial verified deals
    if (existing.length === 0) {
      for (const d of INITIAL_DEAL_CANDIDATES) {
        await db.insert(schema.dealCandidates).values({
          id: d.id,
          externalId: d.sourceExternalId,
          vendor: d.vendor,
          title: d.title,
          slug: d.slug,
          summary: d.summary,
          dealType: d.dealType,
          detectedValueNprMinor: d.detectedValueNprMinor,
          currency: d.currency || "NPR",
          promoCode: d.promoCode,
          eligibility: d.eligibility,
          cardRequired: d.cardRequired,
          sourceClaimUrl: d.sourceClaimUrl,
          officialVendorUrl: d.officialVendorUrl || d.sourceClaimUrl,
          validFrom: d.validFrom ? new Date(d.validFrom) : null,
          validUntil: d.validUntil ? new Date(d.validUntil) : null,
          status: d.status,
          approvalType: d.approvalType,
          saleRightsStatus: d.saleRightsStatus || "FREE_LINK_ONLY",
          verificationScore: d.verificationScore,
          vendorClaimSummary: d.vendorClaimSummary,
          category: d.category,
          lastVerifiedAt: d.lastVerifiedAt ? new Date(d.lastVerifiedAt) : null,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        });
      }
    }

    // Load from DB
    const freshRows = await db.select().from(schema.dealCandidates).orderBy(desc(schema.dealCandidates.updatedAt));
    const revRows = await db.select().from(schema.dealRevisions).orderBy(desc(schema.dealRevisions.detectedAt));

    dealsStore = freshRows.map((row) => {
      const revisions: DealRevision[] = revRows
        .filter((r) => r.dealId === row.id)
        .map((r) => ({
          id: r.id,
          candidateId: r.dealId,
          field: r.field,
          oldValue: r.oldValue,
          newValue: r.newValue,
          reason: r.reason || undefined,
          changedBy: r.changedBy,
          createdAt: r.detectedAt.toISOString(),
        }));
      return mapDbRowToCandidate(row, revisions);
    });

    dbSyncInitialized = true;
    return dealsStore;
  } catch (err) {
    console.warn("[deals] Database sync fell back to memory:", err);
    dbSyncInitialized = true;
    return dealsStore;
  }
}

// Kick off initial sync asynchronously if db is present
if (!dbSyncInitialized && typeof window === "undefined") {
  syncDealsFromDatabase().catch(() => {});
}

export function getAllDealCandidates(): DealCandidate[] {
  checkDealExpirations();
  return [...dealsStore];
}

export async function getAllDealCandidatesAsync(): Promise<DealCandidate[]> {
  await syncDealsFromDatabase();
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

  const revision: DealRevision = {
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

  // Persist to PostgreSQL if connected
  const db = getDb();
  if (db) {
    (async () => {
      try {
        await db
          .update(schema.dealCandidates)
          .set({
            status: "PUBLISHED",
            approvalType,
            assignedProductId: assignedProductId || null,
            publishedAt: new Date(now),
            updatedAt: new Date(now),
          })
          .where(eq(schema.dealCandidates.id, candidateId));

        await db.insert(schema.dealRevisions).values({
          dealId: candidateId,
          field: "status",
          oldValue: candidate.status,
          newValue: "PUBLISHED",
          reason: revision.reason,
          changedBy: adminUser,
        });
      } catch (e) {
        console.error("[deals] Failed to persist approval to DB:", e);
      }
    })();
  }

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

  const revision: DealRevision = {
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

  // Persist to PostgreSQL if connected
  const db = getDb();
  if (db) {
    (async () => {
      try {
        await db
          .update(schema.dealCandidates)
          .set({
            status: "REJECTED",
            updatedAt: new Date(now),
          })
          .where(eq(schema.dealCandidates.id, candidateId));

        await db.insert(schema.dealRevisions).values({
          dealId: candidateId,
          field: "status",
          oldValue: candidate.status,
          newValue: "REJECTED",
          reason,
          changedBy: adminUser,
        });
      } catch (e) {
        console.error("[deals] Failed to persist rejection to DB:", e);
      }
    })();
  }

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

  // Persist to PostgreSQL if connected
  const db = getDb();
  if (db) {
    (async () => {
      try {
        await db
          .update(schema.dealCandidates)
          .set({
            title: updates.title,
            vendor: updates.vendor,
            summary: updates.summary,
            verificationScore: updates.verificationScore,
            status: updates.status,
            approvalType: updates.approvalType,
            promoCode: updates.promoCode,
            eligibility: updates.eligibility,
            updatedAt: new Date(now),
          })
          .where(eq(schema.dealCandidates.id, candidateId));
      } catch (e) {
        console.error("[deals] Failed to persist update to DB:", e);
      }
    })();
  }

  return updated;
}

export function addDealCandidate(candidate: DealCandidate): DealCandidate {
  dealsStore.unshift(candidate);

  const db = getDb();
  if (db) {
    (async () => {
      try {
        await db.insert(schema.dealCandidates).values({
          id: candidate.id,
          vendor: candidate.vendor,
          title: candidate.title,
          slug: candidate.slug,
          summary: candidate.summary,
          dealType: candidate.dealType,
          detectedValueNprMinor: candidate.detectedValueNprMinor,
          currency: candidate.currency || "NPR",
          promoCode: candidate.promoCode,
          eligibility: candidate.eligibility,
          cardRequired: candidate.cardRequired,
          sourceClaimUrl: candidate.sourceClaimUrl,
          officialVendorUrl: candidate.officialVendorUrl || candidate.sourceClaimUrl,
          status: candidate.status,
          verificationScore: candidate.verificationScore,
          category: candidate.category,
        });
      } catch (e) {
        console.error("[deals] Failed to persist new candidate to DB:", e);
      }
    })();
  }

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

/** Reset store — tests only */
export function resetDealsStoreForTest(items?: DealCandidate[]): void {
  dealsStore = items ? [...items] : [...INITIAL_DEAL_CANDIDATES];
}
