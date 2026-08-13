import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { appendAuditEvent } from "@/lib/audit/log";
import { isValidNepaliPhone } from "@/lib/utils";

export type QuoteStatus =
  | "REQUESTED"
  | "SCOPING"
  | "PROPOSAL_READY"
  | "APPROVED"
  | "DECLINED"
  | "EXPIRED"
  | "CONVERTED";

export type QuoteRequestInput = {
  customerName: string;
  businessName: string;
  customerPhone: string;
  teamSize?: string;
  budgetRange?: string;
  goal: string;
  currentTools?: string;
};

export type QuoteEvent = {
  id: string;
  eventType: string;
  message: string;
  createdAt: string;
};

export type QuoteRecord = QuoteRequestInput & {
  id: string;
  reference: string;
  secureToken: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  validUntil: string | null;
  events: QuoteEvent[];
};

type QuoteRow = typeof schema.quotes.$inferSelect;
type QuoteEventRow = typeof schema.quoteEvents.$inferSelect;

const demoQuotes = new Map<string, QuoteRecord>();

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function normalizeRequired(value: string, label: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) throw new Error(`${label} is required.`);
  if (normalized.length > maxLength) throw new Error(`${label} is too long.`);
  return normalized;
}

function generateReference() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `THX-Q-${date}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
}

function generateSecureToken() {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().slice(0, 8);
}

function toRecord(row: QuoteRow, events: QuoteEventRow[]): QuoteRecord {
  return {
    id: row.id,
    reference: row.reference,
    secureToken: row.secureToken,
    customerName: row.customerName,
    businessName: row.businessName,
    customerPhone: row.customerPhone,
    teamSize: row.teamSize ?? undefined,
    budgetRange: row.budgetRange ?? undefined,
    goal: row.goal,
    currentTools: row.currentTools ?? undefined,
    status: row.status as QuoteStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    validUntil: row.validUntil?.toISOString() ?? null,
    events: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      message: event.message,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}

function validateInput(input: QuoteRequestInput): QuoteRequestInput {
  const customerPhone = normalizePhone(input.customerPhone);
  if (!isValidNepaliPhone(customerPhone)) {
    throw new Error("Use a valid Nepali mobile number for the quote request.");
  }

  return {
    customerName: normalizeRequired(input.customerName, "Your name", 120),
    businessName: normalizeRequired(input.businessName, "Business name", 160),
    customerPhone,
    teamSize: input.teamSize?.trim().slice(0, 80) || undefined,
    budgetRange: input.budgetRange?.trim().slice(0, 80) || undefined,
    goal: normalizeRequired(input.goal, "Desired outcome", 2000),
    currentTools: input.currentTools?.trim().slice(0, 1000) || undefined,
  };
}

export async function createQuote(input: QuoteRequestInput): Promise<QuoteRecord> {
  const valid = validateInput(input);
  const reference = generateReference();
  const secureToken = generateSecureToken();
  const createdAt = new Date();
  const db = getDb();

  if (!db) {
    const quote: QuoteRecord = {
      id: crypto.randomUUID(),
      reference,
      secureToken,
      ...valid,
      status: "REQUESTED",
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      validUntil: null,
      events: [
        {
          id: crypto.randomUUID(),
          eventType: "QUOTE_REQUESTED",
          message: "Your business AI quote request was received by TRIHEX.",
          createdAt: createdAt.toISOString(),
        },
      ],
    };
    demoQuotes.set(secureToken, quote);
    return quote;
  }

  const [row] = await db
    .insert(schema.quotes)
    .values({
      reference,
      secureToken,
      customerName: valid.customerName,
      businessName: valid.businessName,
      customerPhone: valid.customerPhone,
      teamSize: valid.teamSize ?? null,
      budgetRange: valid.budgetRange ?? null,
      goal: valid.goal,
      currentTools: valid.currentTools ?? null,
      requestedServices: [{ label: "Business AI setup quote" }],
    })
    .returning();
  if (!row) throw new Error("Quote could not be created.");

  const [event] = await db
    .insert(schema.quoteEvents)
    .values({
      quoteId: row.id,
      eventType: "QUOTE_REQUESTED",
      message: "Your business AI quote request was received by TRIHEX.",
      metadata: { source: "website" },
    })
    .returning();

  await appendAuditEvent({
    action: "QUOTE_REQUESTED",
    entityType: "quote",
    entityId: row.id,
    metadata: { reference: row.reference, source: "website" },
  });

  return toRecord(row, event ? [event] : []);
}

export async function getQuoteBySecureToken(token: string): Promise<QuoteRecord | null> {
  const db = getDb();
  if (!db) return demoQuotes.get(token) ?? null;

  const [row] = await db
    .select()
    .from(schema.quotes)
    .where(eq(schema.quotes.secureToken, token))
    .limit(1);
  if (!row) return null;
  const events = await db
    .select()
    .from(schema.quoteEvents)
    .where(eq(schema.quoteEvents.quoteId, row.id))
    .orderBy(desc(schema.quoteEvents.createdAt));
  return toRecord(row, events);
}

export async function listRecentQuotes(limit = 50): Promise<QuoteRecord[]> {
  const db = getDb();
  if (!db) {
    return [...demoQuotes.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  const rows = await db
    .select()
    .from(schema.quotes)
    .orderBy(desc(schema.quotes.createdAt))
    .limit(limit);
  return Promise.all(
    rows.map(async (row) => {
      const events = await db
        .select()
        .from(schema.quoteEvents)
        .where(eq(schema.quoteEvents.quoteId, row.id))
        .orderBy(desc(schema.quoteEvents.createdAt));
      return toRecord(row, events);
    }),
  );
}

export async function updateQuoteStatus(input: {
  quoteId: string;
  status: QuoteStatus;
  message: string;
  actorId?: string | null;
}): Promise<QuoteRecord | null> {
  const db = getDb();
  if (!db) {
    for (const [token, quote] of demoQuotes.entries()) {
      if (quote.id !== input.quoteId) continue;
      const updated: QuoteRecord = {
        ...quote,
        status: input.status,
        updatedAt: new Date().toISOString(),
        events: [
          {
            id: crypto.randomUUID(),
            eventType: `STATUS_${input.status}`,
            message: input.message,
            createdAt: new Date().toISOString(),
          },
          ...quote.events,
        ],
      };
      demoQuotes.set(token, updated);
      return updated;
    }
    return null;
  }

  const [row] = await db
    .update(schema.quotes)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(schema.quotes.id, input.quoteId))
    .returning();
  if (!row) return null;
  const message = input.message.trim() || `Quote status changed to ${input.status}.`;
  await db.insert(schema.quoteEvents).values({
    quoteId: row.id,
    eventType: `STATUS_${input.status}`,
    message,
    actorId: input.actorId ?? null,
  });
  await appendAuditEvent({
    action: "QUOTE_STATUS_UPDATED",
    actorId: input.actorId ?? null,
    entityType: "quote",
    entityId: row.id,
    metadata: { reference: row.reference, status: input.status },
  });
  return getQuoteBySecureToken(row.secureToken);
}
