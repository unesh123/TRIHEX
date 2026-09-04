/**
 * Safe HTTP Fetcher with SSRF and Injection Protections
 *
 * Enforces:
 * - HTTPS-only by default
 * - Blocks loopback, RFC1918 private IPs, link-local and cloud metadata endpoints
 * - Strict User-Agent identification
 * - Enforced request timeouts
 * - Maximum response body size limits
 * - MIME-type validation
 */

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
  allowedDomains?: string[];
  allowedMimeTypes?: string[];
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "HEAD";
  body?: string;
  allowInsecureHttp?: boolean;
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
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const TRIHEX_USER_AGENT = "TRIHEX-Digital-Bot/1.0 (+https://trihexdigital.shop/bot)";

// Private / reserved IPv4 octet checks
function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => Number.parseInt(n, 10));
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;

  const [a, b] = parts;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (link-local, cloud metadata)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 100.64.0.0/10 (carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // Broadcast / multicast
  if (a >= 224) return true;

  return false;
}

export function isDisallowedHost(hostname: string): boolean {
  const clean = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");

  // Hostname string checks
  if (
    clean === "localhost" ||
    clean.endsWith(".localhost") ||
    clean.endsWith(".local") ||
    clean.endsWith(".internal") ||
    clean === "metadata.google.internal" ||
    clean.endsWith(".onion")
  ) {
    return true;
  }

  // Check IPv6 loopback / link-local / ULA
  if (
    clean === "::1" ||
    clean === "0:0:0:0:0:0:0:1" ||
    clean.startsWith("fe80:") ||
    clean.startsWith("fc00:") ||
    clean.startsWith("fd00:")
  ) {
    return true;
  }

  // IPv4 regex check
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(clean)) {
    return isPrivateOrReservedIpv4(clean);
  }

  return false;
}

export async function safeFetch<T = string>(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
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

  // Protocol check
  if (parsedUrl.protocol !== "https:" && !(options.allowInsecureHttp && parsedUrl.protocol === "http:")) {
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

  // Host validation (SSRF defense)
  if (isDisallowedHost(parsedUrl.hostname)) {
    return {
      ok: false,
      status: 0,
      statusText: "SSRF_BLOCKED",
      data: null,
      contentType: "",
      headers: {},
      error: `Access to hostname "${parsedUrl.hostname}" is blocked for security reasons.`,
    };
  }

  // Allowed domains check if specified
  if (options.allowedDomains && options.allowedDomains.length > 0) {
    const isDomainAllowed = options.allowedDomains.some(
      (domain) =>
        parsedUrl.hostname.toLowerCase() === domain.toLowerCase() ||
        parsedUrl.hostname.toLowerCase().endsWith(`.${domain.toLowerCase()}`)
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
      redirect: "follow",
    });

    clearTimeout(timer);

    const contentType = response.headers.get("content-type") || "";

    // MIME type check if specified
    if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      const matches = options.allowedMimeTypes.some((mime) =>
        contentType.toLowerCase().includes(mime.toLowerCase())
      );
      if (!matches) {
        return {
          ok: false,
          status: response.status,
          statusText: response.statusText,
          data: null,
          contentType,
          headers: Object.fromEntries(response.headers.entries()),
          error: `Content-Type "${contentType}" is not accepted.`,
        };
      }
    }

    // Size limit check via Content-Length header first
    const declaredLength = response.headers.get("content-length");
    if (declaredLength) {
      const size = Number.parseInt(declaredLength, 10);
      if (size > maxSizeBytes) {
        return {
          ok: false,
          status: response.status,
          statusText: "PAYLOAD_TOO_LARGE",
          data: null,
          contentType,
          headers: Object.fromEntries(response.headers.entries()),
          error: `Response payload (${size} bytes) exceeds maximum permitted limit (${maxSizeBytes} bytes).`,
        };
      }
    }

    // Read body with streaming size enforcement
    const rawText = await response.text();
    const actualByteSize = Buffer.byteLength(rawText, "utf8");
    if (actualByteSize > maxSizeBytes) {
      return {
        ok: false,
        status: response.status,
        statusText: "PAYLOAD_TOO_LARGE",
        data: null,
        contentType,
        headers: Object.fromEntries(response.headers.entries()),
        error: `Response content (${actualByteSize} bytes) exceeded maximum permitted limit (${maxSizeBytes} bytes).`,
      };
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
    };
  }
}
