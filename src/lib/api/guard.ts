import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import type { AdminGateResult } from "@/lib/auth/admin-gate";

export async function requireAdminApi(): Promise<
  AdminGateResult & { ok: true }
> {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    throw new AdminApiError(
      gate.reason === "forbidden" ? 403 : 401,
      gate.reason === "forbidden" ? "Forbidden" : "Unauthorized",
    );
  }
  return gate as AdminGateResult & { ok: true };
}

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export function requireCronSecret(request: Request): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new AdminApiError(503, "CRON_SECRET is not configured.");
  }

  // Strictly forbid query-parameter authentication to prevent secret leakage in logs, analytics, and browser history
  const url = new URL(request.url);
  if (url.searchParams.has("key") || url.searchParams.has("secret") || url.searchParams.has("token")) {
    throw new AdminApiError(
      401,
      "Query parameter authentication is forbidden for cron endpoints. Supply secret via Authorization: Bearer <secret> header."
    );
  }

  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AdminApiError(401, "Missing Authorization: Bearer <secret> header.");
  }

  const token = auth.slice(7).trim();
  const tokenBuf = Buffer.from(token, "utf-8");
  const secretBuf = Buffer.from(secret, "utf-8");

  // Constant-time length and content comparison against timing attacks
  if (tokenBuf.length !== secretBuf.length || !timingSafeEqual(tokenBuf, secretBuf)) {
    throw new AdminApiError(401, "Invalid cron secret.");
  }
}

