/**
 * Resolve checkout bank QR path from business settings (admin upload)
 * with fallback to the committed static asset.
 */

import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { isDatabaseConfigured } from "@/lib/env";
import { STOREFRONT_BANK_QR_PATH } from "@/lib/payments/storefront-payment";

const CACHE_TTL_MS = 30_000;
let cached: { url: string; at: number } | null = null;

export async function resolveStorefrontBankQrPath(): Promise<string> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.url;
  }

  if (!isDatabaseConfigured()) {
    return STOREFRONT_BANK_QR_PATH;
  }

  try {
    const db = getDb();
    if (!db) return STOREFRONT_BANK_QR_PATH;
    const rows = await db
      .select({ socialLinks: schema.businessSettings.socialLinks })
      .from(schema.businessSettings)
      .limit(1);
    const links = rows[0]?.socialLinks ?? {};
    const url =
      typeof links.bankQrUrl === "string" && links.bankQrUrl.startsWith("http")
        ? links.bankQrUrl
        : typeof links.bankQrPath === "string" &&
            links.bankQrPath.startsWith("/")
          ? links.bankQrPath
          : STOREFRONT_BANK_QR_PATH;
    cached = { url, at: Date.now() };
    return url;
  } catch {
    return STOREFRONT_BANK_QR_PATH;
  }
}

export function clearBankQrCache() {
  cached = null;
}
