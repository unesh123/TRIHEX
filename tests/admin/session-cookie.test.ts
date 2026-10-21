import { describe, it, expect } from "vitest";
import {
  buildAdminSessionCookieValue,
  parseAdminSessionCookie,
} from "@/lib/admin/session-cookie";
import { isOwnerEmail } from "@/lib/auth/owner";

describe("AES-256-GCM Cryptographic Session Tokens", () => {
  it("encrypts and decrypts session tokens using authenticated AES-256-GCM", () => {
    const email = "jenok_unesh@kkt.redhat.com";
    const token = buildAdminSessionCookieValue(email);

    expect(token.startsWith("v2.")).toBe(true);

    const parsed = parseAdminSessionCookie(token);
    expect(parsed).not.toBeNull();
    expect(parsed?.email).toBe(email);
  });

  it("authorizes both uneshbastola888@gmail.com and jenok_unesh@kkt.redhat.com", () => {
    expect(isOwnerEmail("uneshbastola888@gmail.com")).toBe(true);
    expect(isOwnerEmail("jenok_unesh@kkt.redhat.com")).toBe(true);
    expect(isOwnerEmail("jenokunesh@gmail.com")).toBe(true);
    expect(isOwnerEmail("hacker@malicious.com")).toBe(false);
  });

  it("cryptographically rejects tampered ciphertext or altered authentication tags", () => {
    const token = buildAdminSessionCookieValue("uneshbastola888@gmail.com");
    const parts = token.split(".");

    // Tamper with ciphertext
    const tamperedCipher = parts[3].slice(0, -2) + "ab";
    const tamperedToken = `${parts[0]}.${parts[1]}.${parts[2]}.${tamperedCipher}`;
    expect(parseAdminSessionCookie(tamperedToken)).toBeNull();

    // Tamper with tag
    const tamperedTag = parts[2].slice(0, -2) + "zz";
    const badTagToken = `${parts[0]}.${parts[1]}.${tamperedTag}.${parts[3]}`;
    expect(parseAdminSessionCookie(badTagToken)).toBeNull();
  });
});
