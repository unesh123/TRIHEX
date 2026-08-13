import { headers } from "next/headers";
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
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    throw new AdminApiError(401, "Invalid cron secret.");
  }
}
