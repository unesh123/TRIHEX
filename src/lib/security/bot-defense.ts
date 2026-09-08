/**
 * TRIHEX DIGITAL — Privacy-First Anti-Bot & Cryptographic Challenge Layer
 *
 * Protects critical endpoints (admin login, checkout, quote requests) from
 * automated crawlers, scrapers, and credential-stuffing bots without
 * disrupting genuine human customers.
 */

import { createHmac, randomBytes } from "crypto";

const BOT_SECRET =
  process.env.BOT_SHIELD_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  "trihex-shield-default-key-nepal-2026";

// In-memory sliding rate-limiter per IP
const ipHits = new Map<string, { count: number; expiresAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Sliding window rate-limiter per IP address.
 */
export function checkRateLimit(
  ip: string,
  options: { maxRequests: number; windowMs: number } = {
    maxRequests: 10,
    windowMs: 60 * 1000,
  }
): RateLimitResult {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.expiresAt) {
    ipHits.set(ip, { count: 1, expiresAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1 };
  }

  if (entry.count >= options.maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.expiresAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.maxRequests - entry.count };
}

/**
 * Generate a lightweight cryptographic token for form submissions.
 * Real browsers calculate the SHA-256 HMAC of the challenge.
 */
export function generateChallengeToken(action: string): {
  challenge: string;
  timestamp: number;
} {
  const timestamp = Date.now();
  const nonce = randomBytes(8).toString("hex");
  const payload = `${action}:${timestamp}:${nonce}`;
  const hmac = createHmac("sha256", BOT_SECRET).update(payload).digest("hex");

  return {
    challenge: `${payload}:${hmac}`,
    timestamp,
  };
}

/**
 * Validate challenge token and honeypot field.
 */
export function verifyBotShield(input: {
  challengeToken?: string | null;
  honeypot?: string | null;
  maxAgeMs?: number;
}): { valid: boolean; reason?: string } {
  // 1. Honeypot check: Bots fill hidden inputs; humans don't
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { valid: false, reason: "honeypot_triggered" };
  }

  // 2. Token presence
  if (!input.challengeToken) {
    // Graceful pass in development
    if (process.env.NODE_ENV !== "production") {
      return { valid: true };
    }
    return { valid: false, reason: "missing_token" };
  }

  try {
    const parts = input.challengeToken.split(":");
    if (parts.length !== 4) {
      return { valid: false, reason: "malformed_token" };
    }

    const [action, timestampStr, nonce, receivedHmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const maxAge = input.maxAgeMs || 15 * 60 * 1000; // 15 mins validity

    // Check expiration and future timestamps
    if (isNaN(timestamp) || now - timestamp > maxAge || timestamp > now + 30000) {
      return { valid: false, reason: "expired_token" };
    }

    // Verify cryptographic signature
    const expectedPayload = `${action}:${timestampStr}:${nonce}`;
    const expectedHmac = createHmac("sha256", BOT_SECRET)
      .update(expectedPayload)
      .digest("hex");

    if (receivedHmac !== expectedHmac) {
      return { valid: false, reason: "invalid_signature" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "verification_exception" };
  }
}
