/**
 * SafeFetch 2.0 — Enterprise HTTP Fetcher with SSRF, DNS Rebinding & Injection Protections
 *
 * Security Invariants:
 * - Strict HTTPS-only by default (rejects http, ftp, file, gopher, data, javascript, blob, ws)
 * - Blocks IPv4 private (RFC1918), loopback, link-local, carrier-grade NAT, broadcast/multicast
 * - Parses and decodes decimal (integer), hex, and octal IP encodings
 * - Blocks IPv6 loopback, link-local, ULA, and IPv4-mapped IPv6 (::ffff:x.x.x.x)
 * - Validates DNS resolution for domains to prevent DNS rebinding
 * - Manual redirect handling with full security re-validation on every hop (blocks redirect-to-private-IP)
 * - Aborts oversized responses while streaming (prevents payload & compression bombs)
 * - Strict User-Agent identification
 * - Enforces per-request timeout
 */

import { promises as dns } from "node:dns";
import { isIP } from "node:net";

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
  maxHtmlBytes?: number;
  maxJsonBytes?: number;
  maxRedirects?: number;
  allowedDomains?: string[];
  allowedMimeTypes?: string[];
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "HEAD";
  body?: string;
  allowInsecureHttp?: boolean;
  skipDnsLookup?: boolean;
}

export interface SafeFetchResult<T = string> {
  ok: boolean;
  status: number;
  statusText: string;
  data: T | null;
  rawText?: string;
  contentType: string;
  headers: Record<string, string>;
  error?: string;
  redirectCount?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const DEFAULT_MAX_REDIRECTS = 5;
const TRIHEX_USER_AGENT = "TRIHEX-Digital-Bot/2.0 (+https://trihexdigital.shop/bot)";

/**
 * Checks if a parsed IPv4 address falls within reserved/private subnets
 */
export function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => Number.parseInt(n, 10));
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;

  const [a, b, c, d] = parts;
  if (a < 0 || a > 255 || b < 0 || b > 255 || c < 0 || c > 255 || d < 0 || d > 255) {
    return true;
  }

  // 0.0.0.0/8 (current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (RFC 1918 Private)
  if (a === 10) return true;
  // 100.64.0.0/10 (Shared address / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-local, AWS/GCP/Azure IMDS)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (RFC 1918 Private)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && c === 0) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;
  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (a === 192 && b === 88 && c === 99) return true;
  // 192.168.0.0/16 (RFC 1918 Private)
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;
  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (Reserved / Future use)
  if (a >= 240) return true;
  // Broadcast
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Normalizes non-standard IPv4 representations:
 * - Dword / Decimal integer: "2130706433" -> "127.0.0.1"
 * - Hex notation: "0x7f000001" -> "127.0.0.1", "0x7f.0.0.1" -> "127.0.0.1"
 * - Octal notation: "0177.0.0.1" -> "127.0.0.1"
 */
export function tryNormalizeIpv4(host: string): string | null {
  const clean = host.trim().toLowerCase();

  // Pure single decimal integer (e.g., 2130706433)
  if (/^\d+$/.test(clean)) {
    const num = Number(clean);
    if (!Number.isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join(".");
    }
  }

  // Pure single hex integer (e.g., 0x7f000001)
  if (/^0x[0-9a-f]+$/i.test(clean)) {
    const num = Number.parseInt(clean, 16);
    if (!Number.isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join(".");
    }
  }

  // Dotted notation (decimal, hex, or octal components)
  const parts = clean.split(".");
  if (parts.length === 4) {
    const parsed: number[] = [];
    for (const p of parts) {
      if (/^0x[0-9a-f]+$/i.test(p)) {
        parsed.push(Number.parseInt(p, 16));
      } else if (/^0[0-7]+$/.test(p)) {
        parsed.push(Number.parseInt(p, 8));
      } else if (/^\d+$/.test(p)) {
        parsed.push(Number.parseInt(p, 10));
      } else {
        return null;
      }
    }
    if (parsed.every((n) => !Number.isNaN(n) && n >= 0 && n <= 255)) {
      return parsed.join(".");
    }
  }

  // Handle shorthand dotted notation (e.g., 127.1 -> 127.0.0.1)
  if (parts.length >= 2 && parts.length <= 3) {
    const parsed: number[] = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      let val = Number.NaN;
      if (/^0x[0-9a-f]+$/i.test(p)) val = Number.parseInt(p, 16);
      else if (/^0[0-7]+$/.test(p)) val = Number.parseInt(p, 8);
      else if (/^\d+$/.test(p)) val = Number.parseInt(p, 10);
      if (Number.isNaN(val)) return null;
      parsed.push(val);
    }
    if (parts.length === 2) {
      // a.b -> a.0.0.b
      const [a, b] = parsed;
      return [a, (b >>> 16) & 255, (b >>> 8) & 255, b & 255].join(".");
    }
    if (parts.length === 3) {
      // a.b.c -> a.b.0.c
      const [a, b, c] = parsed;
      return [a, b, (c >>> 8) & 255, c & 255].join(".");
    }
  }

  return null;
}

/**
 * Validates whether an IPv6 address is private, loopback, or cloud-scoped
 */
export function isPrivateOrReservedIpv6(cleanIp: string): boolean {
  const norm = cleanIp.toLowerCase().replace(/^\[|\]$/g, "");

  // Loopback (::1)
  if (norm === "::1" || norm === "0:0:0:0:0:0:0:1") return true;
  // Unspecified (::)
  if (norm === "::" || norm === "0:0:0:0:0:0:0:0") return true;

  // Link-Local (fe80::/10)
  if (norm.startsWith("fe8") || norm.startsWith("fe9") || norm.startsWith("fea") || norm.startsWith("feb")) {
    return true;
  }

  // Unique Local Address (fc00::/7 -> fc00:: and fd00::)
  if (norm.startsWith("fc") || norm.startsWith("fd")) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (norm.includes("::ffff:")) {
    const ipv4Part = norm.split("::ffff:")[1]?.split("%")[0];
    if (ipv4Part) {
      const normalizedIpv4 = tryNormalizeIpv4(ipv4Part) || (isIP(ipv4Part) === 4 ? ipv4Part : null);
      if (normalizedIpv4 && isPrivateOrReservedIpv4(normalizedIpv4)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a host string matches internal, cloud metadata, or private IP patterns
 */
export function isDisallowedHost(hostname: string): boolean {
  const clean = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");

  // Hostname string checks
  if (
    clean === "localhost" ||
    clean.endsWith(".localhost") ||
    clean.endsWith(".local") ||
    clean.endsWith(".internal") ||
    clean.endsWith(".lan") ||
    clean.endsWith(".home") ||
    clean === "metadata.google.internal" ||
    clean === "instance-data.ec2.internal" ||
    clean.endsWith(".onion")
  ) {
    return true;
  }

  // Check known cloud metadata hosts & addresses
  if (
    clean === "169.254.169.254" ||
    clean === "169.254.170.2" ||
    clean === "100.100.100.200" ||
    clean === "fd00:ec2::254"
  ) {
    return true;
  }

  // Attempt IPv4 normalization (handles decimal, hex, octal, dotted)
  const normalizedIpv4 = tryNormalizeIpv4(clean);
  if (normalizedIpv4) {
    return isPrivateOrReservedIpv4(normalizedIpv4);
  }

  // Check standard IPv6
  if (clean.includes(":")) {
    return isPrivateOrReservedIpv6(clean);
  }

  return false;
}

/**
 * Resolves a hostname via DNS and validates all returned IP addresses against SSRF rules
 */
export async function resolveAndValidateHost(
  hostname: string,
  skipDns = false
): Promise<{ ok: boolean; reason?: string }> {
  if (isDisallowedHost(hostname)) {
    return { ok: false, reason: `Hostname "${hostname}" is blocked by security policy.` };
  }

  // If skipDns requested or running in pure unit-mock mode
  if (skipDns) return { ok: true };

  // If already an IP literal that passed isDisallowedHost, no DNS lookup needed
  if (isIP(hostname.replace(/^\[|\]$/g, "")) !== 0 || tryNormalizeIpv4(hostname)) {
    return { ok: true };
  }

  try {
    const records = await dns.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      return { ok: false, reason: `DNS lookup failed for "${hostname}": no records found.` };
    }

    for (const record of records) {
      if (record.family === 4) {
        if (isPrivateOrReservedIpv4(record.address)) {
          return {
            ok: false,
            reason: `DNS for "${hostname}" resolved to prohibited private IP: ${record.address}`,
          };
        }
      } else if (record.family === 6) {
        if (isPrivateOrReservedIpv6(record.address)) {
          return {
            ok: false,
            reason: `DNS for "${hostname}" resolved to prohibited private IPv6: ${record.address}`,
          };
        }
      }
    }

    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      reason: `DNS resolution failed for "${hostname}": ${err?.message || "Lookup error"}`,
    };
  }
}

/**
 * SafeFetch 2.0 Entrypoint
 */
export async function safeFetch<T = string>(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  let currentUrl = targetUrl;
  let redirectCount = 0;
  const visitedUrls = new Set<string>();

  while (true) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(currentUrl);
    } catch (err) {
      return {
        ok: false,
        status: 0,
        statusText: "INVALID_URL",
        data: null,
        contentType: "",
        headers: {},
        error: `Invalid URL: ${(err as Error).message}`,
      };
    }

    // Scheme verification
    const isHttps = parsedUrl.protocol === "https:";
    const isAllowedHttp = options.allowInsecureHttp && parsedUrl.protocol === "http:";
    if (!isHttps && !isAllowedHttp) {
      return {
        ok: false,
        status: 0,
        statusText: "INSECURE_PROTOCOL",
        data: null,
        contentType: "",
        headers: {},
        error: `Disallowed protocol "${parsedUrl.protocol}". Only HTTPS is allowed.`,
      };
    }

    // Credentials in URL rejected
    if (parsedUrl.username || parsedUrl.password) {
      return {
        ok: false,
        status: 0,
        statusText: "CREDENTIALS_IN_URL",
        data: null,
        contentType: "",
        headers: {},
        error: "URLs containing embedded userinfo/credentials are prohibited.",
      };
    }

    // SSRF & DNS validation
    const validation = await resolveAndValidateHost(parsedUrl.hostname, options.skipDnsLookup);
    if (!validation.ok) {
      return {
        ok: false,
        status: 0,
        statusText: "SSRF_BLOCKED",
        data: null,
        contentType: "",
        headers: {},
        error: validation.reason || "Destination host is prohibited.",
      };
    }

    // Domain allowlist verification if specified
    if (options.allowedDomains && options.allowedDomains.length > 0) {
      const lowerHost = parsedUrl.hostname.toLowerCase();
      const isDomainAllowed = options.allowedDomains.some(
        (domain) => lowerHost === domain.toLowerCase() || lowerHost.endsWith(`.${domain.toLowerCase()}`)
      );
      if (!isDomainAllowed) {
        return {
          ok: false,
          status: 0,
          statusText: "DOMAIN_NOT_ALLOWED",
          data: null,
          contentType: "",
          headers: {},
          error: `Hostname "${parsedUrl.hostname}" is not in the configured domain allowlist.`,
        };
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Manual redirect control — we inspect and validate every single redirect
      const response = await fetch(parsedUrl.toString(), {
        method: options.method ?? "GET",
        headers: {
          "User-Agent": TRIHEX_USER_AGENT,
          Accept: "application/json, text/plain, text/html, application/xml, */*",
          ...(options.headers ?? {}),
        },
        body: options.body,
        signal: controller.signal,
        cache: "no-store",
        redirect: "manual",
      });

      clearTimeout(timer);

      // Handle HTTP redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectCount++;
        if (redirectCount > maxRedirects) {
          return {
            ok: false,
            status: response.status,
            statusText: "TOO_MANY_REDIRECTS",
            data: null,
            contentType: "",
            headers: Object.fromEntries(response.headers.entries()),
            error: `Exceeded maximum redirect limit of ${maxRedirects}.`,
            redirectCount,
          };
        }

        const location = response.headers.get("location");
        if (!location) {
          return {
            ok: false,
            status: response.status,
            statusText: "INVALID_REDIRECT",
            data: null,
            contentType: "",
            headers: Object.fromEntries(response.headers.entries()),
            error: `HTTP ${response.status} redirect received without Location header.`,
            redirectCount,
          };
        }

        const nextUrl = new URL(location, currentUrl).toString();
        if (visitedUrls.has(nextUrl)) {
          return {
            ok: false,
            status: response.status,
            statusText: "REDIRECT_LOOP",
            data: null,
            contentType: "",
            headers: Object.fromEntries(response.headers.entries()),
            error: `Redirect loop detected targeting: ${nextUrl}`,
            redirectCount,
          };
        }

        visitedUrls.add(currentUrl);
        currentUrl = nextUrl;
        continue; // Loop back and validate destination URL completely
      }

      const contentType = response.headers.get("content-type") || "";

      // MIME type check
      if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
        const matches = options.allowedMimeTypes.some((mime) =>
          contentType.toLowerCase().includes(mime.toLowerCase())
        );
        if (!matches) {
          return {
            ok: false,
            status: response.status,
            statusText: "INVALID_CONTENT_TYPE",
            data: null,
            contentType,
            headers: Object.fromEntries(response.headers.entries()),
            error: `Content-Type "${contentType}" is not in the allowed list.`,
          };
        }
      }

      // Determine effective size limit based on content type
      let effectiveLimit = maxSizeBytes;
      if (contentType.includes("text/html") && options.maxHtmlBytes) {
        effectiveLimit = Math.min(effectiveLimit, options.maxHtmlBytes);
      } else if (
        (contentType.includes("application/json") || contentType.includes("+json")) &&
        options.maxJsonBytes
      ) {
        effectiveLimit = Math.min(effectiveLimit, options.maxJsonBytes);
      }

      // Pre-check Content-Length header
      const declaredLength = response.headers.get("content-length");
      if (declaredLength) {
        const size = Number.parseInt(declaredLength, 10);
        if (!Number.isNaN(size) && size > effectiveLimit) {
          return {
            ok: false,
            status: response.status,
            statusText: "PAYLOAD_TOO_LARGE",
            data: null,
            contentType,
            headers: Object.fromEntries(response.headers.entries()),
            error: `Response payload (${size} bytes) exceeds limit (${effectiveLimit} bytes).`,
          };
        }
      }

      // Stream response with real-time byte ceiling enforcement
      let rawText = "";
      let actualByteSize = 0;

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              actualByteSize += value.byteLength;
              if (actualByteSize > effectiveLimit) {
                await reader.cancel("Size limit exceeded");
                return {
                  ok: false,
                  status: response.status,
                  statusText: "PAYLOAD_TOO_LARGE",
                  data: null,
                  contentType,
                  headers: Object.fromEntries(response.headers.entries()),
                  error: `Response exceeded byte limit (${effectiveLimit} bytes). Stream aborted.`,
                };
              }
              rawText += decoder.decode(value, { stream: true });
            }
          }
          rawText += decoder.decode();
        } catch (err: any) {
          if (actualByteSize > effectiveLimit) {
            return {
              ok: false,
              status: response.status,
              statusText: "PAYLOAD_TOO_LARGE",
              data: null,
              contentType,
              headers: Object.fromEntries(response.headers.entries()),
              error: `Response exceeded byte limit. Stream aborted.`,
            };
          }
          throw err;
        }
      } else {
        rawText = await response.text();
      }

      let parsedData: any = rawText;
      if (contentType.includes("application/json") || contentType.includes("+json")) {
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          parsedData = rawText;
        }
      }

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: parsedData as T,
        rawText,
        contentType,
        headers: Object.fromEntries(response.headers.entries()),
        redirectCount,
      };
    } catch (err: any) {
      clearTimeout(timer);
      const isTimeout = err?.name === "AbortError";
      return {
        ok: false,
        status: isTimeout ? 408 : 0,
        statusText: isTimeout ? "REQUEST_TIMEOUT" : "FETCH_ERROR",
        data: null,
        contentType: "",
        headers: {},
        error: isTimeout ? `Request timed out after ${timeoutMs}ms` : err?.message ?? "Network error",
        redirectCount,
      };
    }
  }
}
