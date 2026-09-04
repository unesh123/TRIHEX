import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isDisallowedHost,
  tryNormalizeIpv4,
  isPrivateOrReservedIpv4,
  isPrivateOrReservedIpv6,
  safeFetch,
} from "@/lib/ingestion/safe-fetch";

describe("SafeFetch 2.0 Security & Attack Defense Matrix", () => {
  describe("Advanced IP Encodings & Obfuscation", () => {
    it("detects and normalizes decimal (integer) IP notation", () => {
      // 2130706433 is decimal for 127.0.0.1
      const normalized = tryNormalizeIpv4("2130706433");
      expect(normalized).toBe("127.0.0.1");
      expect(isDisallowedHost("2130706433")).toBe(true);

      // 2886729729 is decimal for 172.16.0.1 (private)
      expect(tryNormalizeIpv4("2886729729")).toBe("172.16.0.1");
      expect(isDisallowedHost("2886729729")).toBe(true);

      // 3232235521 is decimal for 192.168.0.1 (private)
      expect(tryNormalizeIpv4("3232235521")).toBe("192.168.0.1");
      expect(isDisallowedHost("3232235521")).toBe(true);
    });

    it("detects and normalizes hex notation", () => {
      // 0x7f000001 -> 127.0.0.1
      expect(tryNormalizeIpv4("0x7f000001")).toBe("127.0.0.1");
      expect(isDisallowedHost("0x7f000001")).toBe(true);

      // 0x7f.0.0.1 -> 127.0.0.1
      expect(tryNormalizeIpv4("0x7f.0.0.1")).toBe("127.0.0.1");
      expect(isDisallowedHost("0x7f.0.0.1")).toBe(true);

      // 0x0a000001 -> 10.0.0.1
      expect(tryNormalizeIpv4("0x0a000001")).toBe("10.0.0.1");
      expect(isDisallowedHost("0x0a000001")).toBe(true);
    });

    it("detects octal IP notation", () => {
      // 0177.0.0.1 -> 127.0.0.1
      expect(tryNormalizeIpv4("0177.0.0.1")).toBe("127.0.0.1");
      expect(isDisallowedHost("0177.0.0.1")).toBe(true);

      // 012.0.0.1 -> 10.0.0.1
      expect(tryNormalizeIpv4("012.0.0.1")).toBe("10.0.0.1");
      expect(isDisallowedHost("012.0.0.1")).toBe(true);
    });

    it("detects shorthand dotted notation", () => {
      // 127.1 -> 127.0.0.1
      expect(tryNormalizeIpv4("127.1")).toBe("127.0.0.1");
      expect(isDisallowedHost("127.1")).toBe(true);

      // 10.1 -> 10.0.0.1
      expect(tryNormalizeIpv4("10.1")).toBe("10.0.0.1");
      expect(isDisallowedHost("10.1")).toBe(true);
    });

    it("detects IPv4-mapped IPv6 addresses", () => {
      expect(isPrivateOrReservedIpv6("::ffff:127.0.0.1")).toBe(true);
      expect(isDisallowedHost("::ffff:127.0.0.1")).toBe(true);
      expect(isDisallowedHost("[::ffff:10.0.0.1]")).toBe(true);
      expect(isDisallowedHost("[::ffff:192.168.1.1]")).toBe(true);
      expect(isDisallowedHost("[::ffff:169.254.169.254]")).toBe(true);
    });

    it("blocks cloud IMDS endpoints and private IPv6 ULA/link-local", () => {
      expect(isDisallowedHost("169.254.169.254")).toBe(true);
      expect(isDisallowedHost("169.254.170.2")).toBe(true);
      expect(isDisallowedHost("100.100.100.200")).toBe(true);
      expect(isDisallowedHost("fd00:ec2::254")).toBe(true);
      expect(isDisallowedHost("fe80::1")).toBe(true);
      expect(isDisallowedHost("fc00::1")).toBe(true);
    });
  });

  describe("URL Protocol & Userinfo Hardening", () => {
    it("rejects non-https protocols", async () => {
      const protocols = ["ftp://example.com", "file:///etc/passwd", "gopher://example.com", "data:text/plain,hello"];
      for (const url of protocols) {
        const res = await safeFetch(url);
        expect(res.ok).toBe(false);
        expect(["INSECURE_PROTOCOL", "INVALID_URL"]).toContain(res.statusText);
      }
    });

    it("rejects embedded user credentials in URL", async () => {
      const res = await safeFetch("https://user:password@example.com/api");
      expect(res.ok).toBe(false);
      expect(res.statusText).toBe("CREDENTIALS_IN_URL");
    });
  });

  describe("Redirect Re-Validation & Loop Protection", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("detects and blocks redirect to private IP / cloud metadata", async () => {
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        callCount++;
        if (callCount === 1) {
          // Public URL redirects to private cloud metadata
          return new Response(null, {
            status: 302,
            headers: { location: "https://169.254.169.254/latest/meta-data/" },
          });
        }
        return new Response("METADATA_LEAKED", { status: 200 });
      });

      const res = await safeFetch("https://example.com/redirect-to-imds", {
        skipDnsLookup: true,
      });

      expect(res.ok).toBe(false);
      expect(res.statusText).toBe("SSRF_BLOCKED");
      expect(callCount).toBe(1); // Second call was blocked before fetch!
    });

    it("detects and halts redirect loops", async () => {
      let currentHop = 0;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        currentHop++;
        const next = currentHop % 2 === 1 ? "https://example.com/b" : "https://example.com/a";
        return new Response(null, {
          status: 302,
          headers: { location: next },
        });
      });

      const res = await safeFetch("https://example.com/a", {
        skipDnsLookup: true,
      });

      expect(res.ok).toBe(false);
      expect(res.statusText).toBe("REDIRECT_LOOP");
    });

    it("enforces max redirect limit", async () => {
      let hop = 0;
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        hop++;
        return new Response(null, {
          status: 302,
          headers: { location: `https://example.com/hop-${hop}` },
        });
      });

      const res = await safeFetch("https://example.com/start", {
        maxRedirects: 3,
        skipDnsLookup: true,
      });

      expect(res.ok).toBe(false);
      expect(res.statusText).toBe("TOO_MANY_REDIRECTS");
      expect(res.redirectCount).toBe(4);
    });
  });

  describe("Streaming Payload Limits & Bomb Defense", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("aborts stream immediately when response size exceeds maxSizeBytes", async () => {
      // Create a stream that emits chunks larger than limit
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(1024 * 1024)); // 1MB chunk 1
          controller.enqueue(new Uint8Array(1024 * 1024)); // 1MB chunk 2
          controller.close();
        },
      });

      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(stream, {
          status: 200,
          headers: { "content-type": "text/plain" },
        })
      );

      const res = await safeFetch("https://example.com/large-data", {
        maxSizeBytes: 500 * 1024, // 500KB limit
        skipDnsLookup: true,
      });

      expect(res.ok).toBe(false);
      expect(res.statusText).toBe("PAYLOAD_TOO_LARGE");
    });
  });
});
