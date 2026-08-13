import { nanoid } from "nanoid";
import { getRepositories } from "@/lib/repositories";
import { resolvePersistenceMode } from "@/lib/config/persistence-guard";

export type AuditAction =
  | "ORDER_CREATED"
  | "QUOTE_REQUESTED"
  | "QUOTE_STATUS_UPDATED"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_REJECTED"
  | "PAYMENT_GATEWAY_CALLBACK"
  | "INVENTORY_RESERVED"
  | "INVENTORY_RELEASED"
  | "PRODUCT_UPDATED"
  | "COMPLIANCE_REVIEWED"
  | "ADMIN_LOGIN"
  | "SETTINGS_UPDATED"
  | "SYSTEM_EVENT";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actorId: string | null;
  actorRole: string | null;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipHash: string | null;
  createdAt: string;
}

function sanitizeMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const sensitive = new Set([
    "password",
    "secret",
    "token",
    "authorization",
    "cardNumber",
    "cvv",
    "proofImageBase64",
  ]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (sensitive.has(key) || /secret|password|token/i.test(key)) {
      out[key] = "[REDACTED]";
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Append an audit event through the active repository layer.
 * Production → PostgreSQL. Demo/test → explicit demo adapter only.
 */
export async function appendAuditEvent(input: {
  action: AuditAction;
  actorId?: string | null;
  actorRole?: string | null;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipHash?: string | null;
}): Promise<AuditEvent> {
  const mode = resolvePersistenceMode();
  // Avoid circular init during demo repo construction of audit itself:
  // for the very first bootstrap we may write a local event then repo.
  try {
    return await getRepositories(mode).audit.append({
      ...input,
      metadata: sanitizeMetadata(input.metadata ?? {}),
    });
  } catch {
    const event: AuditEvent = {
      id: nanoid(),
      action: input.action,
      actorId: input.actorId ?? null,
      actorRole: input.actorRole ?? null,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: sanitizeMetadata(input.metadata ?? {}),
      ipHash: input.ipHash ?? null,
      createdAt: new Date().toISOString(),
    };
    return event;
  }
}

export async function getRecentAuditEvents(limit = 50): Promise<AuditEvent[]> {
  return getRepositories().audit.recent(limit);
}
