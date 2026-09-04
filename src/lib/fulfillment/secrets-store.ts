/**
 * Server-only Fulfillment Secret Store & Signed Delivery Token Engine.
 * Never import this file in client components.
 */
import crypto from "crypto";
import { isProductionRuntime, ConfigurationError } from "@/lib/config/persistence-guard";

if (typeof window !== "undefined") {
  throw new Error("secrets-store is server-only and cannot be imported in client components");
}

function getSigningSecret(): string {
  const secret =
    process.env.FULFILLMENT_SIGNING_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET;

  if (isProductionRuntime()) {
    if (!secret || secret.length < 32) {
      throw new ConfigurationError(
        "FULFILLMENT_SIGNING_SECRET or AUTH_SECRET (min 32 chars) is strictly required in production."
      );
    }
    return secret;
  }

  return secret || "trihex_sec_dev_fallback_signing_key_strictly_dev_only";
}

export interface DeliveryTokenPayload {
  orderId: string;
  orderNumber: string;
  sku: string;
  secretId: string;
  exp: number; // Unix timestamp in seconds
  issuedAt: number;
}

export interface SecureDeliverable {
  secretId: string;
  title: string;
  category: string;
  downloadUrl?: string;
  accessInstructions: string;
  deliverableType: "SIGNED_EXPIRING_URL" | "SECURE_CREDENTIALS" | "LICENSE_KEY";
  /** Secure access pass / license key (stored strictly server-side) */
  licenseCode?: string;
  maxDownloadsAllowed?: number;
}

/**
 * Server-side registry of fulfillment secrets.
 * Rotated immediately: the previously leaked key has been revoked and replaced with secure token authorization.
 */
const SERVER_SECRET_REGISTRY: Record<string, SecureDeliverable> = {
  "sec-vault-aimoney-2026": {
    secretId: "sec-vault-aimoney-2026",
    title: "AI Money Maker Digital Products Course (2026)",
    category: "digital-assets",
    downloadUrl: "https://mega.nz/folder/trihex-vault-aimoney-v2",
    accessInstructions:
      "Use your unique single-use signed download token below. The package includes 50+ master prompts, funnel blueprints, and automated dropshipping templates.",
    deliverableType: "SIGNED_EXPIRING_URL",
    licenseCode: "TRX-AIMONEY-V2-ROTATED-AUTH",
    maxDownloadsAllowed: 5,
  },
  "sec-vault-psych-close": {
    secretId: "sec-vault-psych-close",
    title: "The Psychology of Closing Bundle",
    category: "digital-assets",
    downloadUrl: "https://cloud.trihexdigital.shop/vault/psychology-of-closing",
    accessInstructions:
      "Includes 47 high-ticket objection rebuttal scripts, B2B cold email matrices, and negotiation psychology training.",
    deliverableType: "SIGNED_EXPIRING_URL",
    licenseCode: "TRX-PSYCH-CLOSE-VIP-2026",
    maxDownloadsAllowed: 5,
  },
  "sec-vault-passive-rebel": {
    secretId: "sec-vault-passive-rebel",
    title: "The Passive Rebel (Antisocial Leads Generation)",
    category: "digital-assets",
    downloadUrl: "https://cloud.trihexdigital.shop/vault/passive-rebel-leads",
    accessInstructions:
      "Complete covert traffic acquisition blueprint, faceless Reddit & SEO funnels, and programmatic scraping SOPs.",
    deliverableType: "SIGNED_EXPIRING_URL",
    licenseCode: "TRX-PASSIVE-REBEL-VAULT-PRO",
    maxDownloadsAllowed: 5,
  },
  "sec-vault-udemy-16": {
    secretId: "sec-vault-udemy-16",
    title: "Udemy 16 Package Developer AI Agent Pack",
    category: "learning",
    downloadUrl: "https://cloud.trihexdigital.shop/vault/udemy-16-ai-agents",
    accessInstructions:
      "16 Complete developer video masterclasses covering autonomous AI agents, Cursor Pro, Claude Code workflows, and code repos.",
    deliverableType: "SIGNED_EXPIRING_URL",
    licenseCode: "TRX-UDEMY-AI-16PACK-SECURE",
    maxDownloadsAllowed: 5,
  },
};

/**
 * Creates a cryptographically signed, expiring, order-scoped delivery token
 */
export function createSignedDeliveryToken(params: {
  orderId: string;
  orderNumber: string;
  sku: string;
  secretId: string;
  expiresInHours?: number;
}): string {
  const expiresInHours = params.expiresInHours ?? 72; // Default 3 days validity
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const issuedAt = Math.floor(Date.now() / 1000);

  const payload: DeliveryTokenPayload = {
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    sku: params.sku,
    secretId: params.secretId,
    exp,
    issuedAt,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a signed delivery token and returns the payload if valid and unexpired
 */
export function verifySignedDeliveryToken(token: string): DeliveryTokenPayload | null {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", getSigningSecret())
      .update(payloadBase64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: DeliveryTokenPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8")
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Resolves a server-only deliverable by secret ID
 */
export function getDeliverableBySecretId(secretId: string): SecureDeliverable | null {
  return SERVER_SECRET_REGISTRY[secretId] ?? null;
}

/**
 * Resolves secretId for a product SKU or name (server-side only)
 */
export function resolveSecretIdForSku(skuOrName: string): string | null {
  const norm = skuOrName.toLowerCase();
  if (norm.includes("aimoney") || norm.includes("ai-money")) {
    return "sec-vault-aimoney-2026";
  }
  if (norm.includes("psych") || norm.includes("closing")) {
    return "sec-vault-psych-close";
  }
  if (norm.includes("rebel") || norm.includes("passive")) {
    return "sec-vault-passive-rebel";
  }
  if (norm.includes("udemy") || norm.includes("16pack") || norm.includes("16-developer")) {
    return "sec-vault-udemy-16";
  }
  return null;
}
