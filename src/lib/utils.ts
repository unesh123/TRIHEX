import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Nepal phone: 98xxxxxxxx / 97xxxxxxxx or +977… */
export function isValidNepaliPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(?:\+977)?9[78]\d{8}$/.test(cleaned);
}

export function generateOrderNumber(prefix = "THX"): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hashIp(ip: string, salt: string): string {
  // Synchronous fallback for Node using a simple HMAC-like mix when crypto.subtle unavailable in sync contexts
  // Prefer async sha256Hex in server routes; this is a deterministic sync helper for tests.
  let h = 0;
  const s = `${salt}:${ip}`;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `ip_${(h >>> 0).toString(16)}`;
}
