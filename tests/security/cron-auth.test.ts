import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { requireCronSecret, AdminApiError } from "@/lib/api/guard";

describe("Cron Authentication Security Guard", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "super_secret_cron_token_32_bytes_long!!";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("passes when valid Authorization: Bearer <secret> header is provided", () => {
    const req = new Request("https://trihexdigital.shop/api/cron/jobs/deal_radar_sync", {
      headers: {
        Authorization: "Bearer super_secret_cron_token_32_bytes_long!!",
      },
    });

    expect(() => requireCronSecret(req)).not.toThrow();
  });

  it("strictly rejects query parameter authentication (?key=secret) with 401", () => {
    const req = new Request(
      "https://trihexdigital.shop/api/cron/jobs/deal_radar_sync?key=super_secret_cron_token_32_bytes_long!!",
      {
        headers: {
          Authorization: "Bearer super_secret_cron_token_32_bytes_long!!",
        },
      }
    );

    expect(() => requireCronSecret(req)).toThrow(AdminApiError);
    try {
      requireCronSecret(req);
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(err.message).toContain("Query parameter authentication is forbidden");
    }
  });

  it("rejects invalid token in Authorization header with 401", () => {
    const req = new Request("https://trihexdigital.shop/api/cron/jobs/deal_radar_sync", {
      headers: {
        Authorization: "Bearer invalid_wrong_token",
      },
    });

    expect(() => requireCronSecret(req)).toThrow(AdminApiError);
    try {
      requireCronSecret(req);
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(err.message).toBe("Invalid cron secret.");
    }
  });

  it("rejects missing Authorization header with 401", () => {
    const req = new Request("https://trihexdigital.shop/api/cron/jobs/deal_radar_sync");

    expect(() => requireCronSecret(req)).toThrow(AdminApiError);
    try {
      requireCronSecret(req);
    } catch (err: any) {
      expect(err.status).toBe(401);
    }
  });

  it("returns 503 when CRON_SECRET is unconfigured", () => {
    delete process.env.CRON_SECRET;
    const req = new Request("https://trihexdigital.shop/api/cron/jobs/deal_radar_sync", {
      headers: {
        Authorization: "Bearer any_token",
      },
    });

    expect(() => requireCronSecret(req)).toThrow(AdminApiError);
    try {
      requireCronSecret(req);
    } catch (err: any) {
      expect(err.status).toBe(503);
      expect(err.message).toContain("CRON_SECRET is not configured");
    }
  });
});
