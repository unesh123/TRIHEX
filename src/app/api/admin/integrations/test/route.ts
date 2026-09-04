import { NextResponse } from "next/server";
import { requireAdminApi, AdminApiError } from "@/lib/api/guard";
import { testProviderConnection } from "@/lib/providers/health";
import { getRegisteredProviders, updateProviderStatus } from "@/lib/providers/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminApi();
    const providers = getRegisteredProviders();
    return NextResponse.json({ providers });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApi();
    const body = await request.json().catch(() => ({}));
    const { providerId, action } = body;

    if (!providerId || typeof providerId !== "string") {
      return NextResponse.json({ error: "providerId is required." }, { status: 400 });
    }

    if (action === "TOGGLE_ENABLED") {
      const providers = getRegisteredProviders();
      const current = providers.find((p) => p.id === providerId);
      if (current) {
        updateProviderStatus(providerId, { enabled: !current.enabled });
      }
      return NextResponse.json({ ok: true, providers: getRegisteredProviders() });
    }

    // Default action: test connection
    const result = await testProviderConnection(providerId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Provider test failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
