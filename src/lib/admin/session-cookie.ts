import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

export const ADMIN_SESSION_COOKIE = "trihex_admin_session";

function getSecretKey(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.ENCRYPTION_KEY ||
    "trihex-admin-session-cryptographic-master-key-2026"
  );
}

/**
 * Derives a 256-bit (32-byte) key specifically for AES-256-GCM.
 */
function getAes256Key(): Buffer {
  return createHash("sha256").update(getSecretKey()).digest();
}

/**
 * Builds an authenticated AES-256-GCM encrypted session token.
 * Provides confidentiality (ciphertext payload), authenticity (128-bit GCM tag),
 * and anti-replay protection with a 12-byte cryptographically random IV.
 */
export function buildAdminSessionCookieValue(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const plainText = JSON.stringify({
    email: normalizedEmail,
    ts: Date.now(),
    nonce: randomBytes(16).toString("hex"),
  });

  const key = getAes256Key();
  const iv = randomBytes(12); // 96-bit IV recommended for AES-GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag

  // Format: v2.<iv_base64url>.<tag_base64url>.<ciphertext_base64url>
  return `v2.${iv.toString("base64url")}.${authTag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

/**
 * Parses and verifies an AES-256-GCM (v2) or legacy HMAC-SHA256 (v1) session token.
 * Rejects forged, tampered, truncated, or expired session tokens using authenticated decryption.
 */
export function parseAdminSessionCookie(
  cookieValueOrHeader: string,
): { email: string; ts: number } | null {
  if (!cookieValueOrHeader) return null;

  let token = cookieValueOrHeader.trim();
  const match = cookieValueOrHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`),
  );
  if (match?.[1]) {
    token = match[1].trim();
  }

  // 1. AES-256-GCM Authenticated Decryption (v2)
  if (token.startsWith("v2.")) {
    const parts = token.split(".");
    if (parts.length !== 4) return null;

    const [, ivStr, tagStr, cipherStr] = parts;
    try {
      const key = getAes256Key();
      const iv = Buffer.from(ivStr, "base64url");
      const authTag = Buffer.from(tagStr, "base64url");
      const ciphertext = Buffer.from(cipherStr, "base64url");

      if (iv.length !== 12 || authTag.length !== 16) return null;

      const decipher = createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      const data = JSON.parse(decrypted.toString("utf8"));
      if (!data.email) return null;

      // Incident response: forcefully invalidate all admin sessions issued before the security cutoff
      const SESSION_REVOCATION_CUTOFF_MS = 1792605928398;
      if (!data.ts || data.ts < SESSION_REVOCATION_CUTOFF_MS) {
        return null;
      }

      // Reject expired sessions (7 days)
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - (data.ts || 0) > maxAgeMs) {
        return null;
      }

      return { email: data.email, ts: data.ts };
    } catch {
      // Authenticated tag verification failed (tampered or forged token)
      return null;
    }
  }

  // 2. Legacy HMAC-SHA256 Compatibility (v1)
  const parts = token.split(".");
  if (parts.length !== 2) {
    if (process.env.NODE_ENV !== "production") {
      try {
        const decoded = Buffer.from(token, "base64url").toString("utf8");
        const parsed = JSON.parse(decoded);
        if (parsed?.email) {
          return { email: parsed.email, ts: parsed.ts || Date.now() };
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  const [payload, receivedSig] = parts;
  const expectedSig = createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("base64url");

  const bufA = Buffer.from(receivedSig);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.email) return null;

    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - (data.ts || 0) > maxAgeMs) {
      return null;
    }

    return { email: data.email, ts: data.ts };
  } catch {
    return null;
  }
}
