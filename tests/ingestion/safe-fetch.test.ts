import { describe, it, expect } from "vitest";
import { isDisallowedHost, safeFetch } from "@/lib/ingestion/safe-fetch";

describe("SafeFetch SSRF Defense Matrix", () => {
  it("blocks localhost and local loopbacks", () => {
    expect(isDisallowedHost("localhost")).toBe(true);
    expect(isDisallowedHost("sub.localhost")).toBe(true);
    expect(isDisallowedHost("127.0.0.1")).toBe(true);
    expect(isDisallowedHost("127.10.20.30")).toBe(true);
    expect(isDisallowedHost("::1")).toBe(true);
  });

  it("blocks cloud instance metadata endpoints", () => {
    expect(isDisallowedHost("169.254.169.254")).toBe(true);
    expect(isDisallowedHost("metadata.google.internal")).toBe(true);
    expect(isDisallowedHost("instance-data.ec2.internal")).toBe(true);
  });

  it("blocks RFC 1918 private IPv4 subnets", () => {
    // 10.0.0.0/8
    expect(isDisallowedHost("10.0.0.1")).toBe(true);
    expect(isDisallowedHost("10.255.255.254")).toBe(true);

    // 172.16.0.0/12
    expect(isDisallowedHost("172.16.0.1")).toBe(true);
    expect(isDisallowedHost("172.31.255.254")).toBe(true);
    expect(isDisallowedHost("172.32.0.1")).toBe(false); // Public IP

    // 192.168.0.0/16
    expect(isDisallowedHost("192.168.1.1")).toBe(true);
    expect(isDisallowedHost("192.168.100.50")).toBe(true);
  });

  it("permits legitimate public domains", () => {
    expect(isDisallowedHost("nrb.org.np")).toBe(false);
    expect(isDisallowedHost("earthquake.usgs.gov")).toBe(false);
    expect(isDisallowedHost("github.com")).toBe(false);
    expect(isDisallowedHost("resourify.com")).toBe(false);
  });

  it("enforces HTTPS protocol by default", async () => {
    const result = await safeFetch("http://example.com");
    expect(result.ok).toBe(false);
    expect(result.statusText).toBe("INSECURE_PROTOCOL");
  });

  it("rejects SSRF target URLs before issuing network socket", async () => {
    const result = await safeFetch("https://169.254.169.254/latest/meta-data/");
    expect(result.ok).toBe(false);
    expect(result.statusText).toBe("SSRF_BLOCKED");
  });

  it("rejects malformed target URLs cleanly", async () => {
    const result = await safeFetch("not-a-valid-url");
    expect(result.ok).toBe(false);
    expect(result.statusText).toBe("INVALID_URL");
  });
});
