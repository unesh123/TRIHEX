import { NextResponse } from "next/server";
import { isDatabaseConfigured, isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "trihex-digital",
    timestamp: new Date().toISOString(),
    database: isDatabaseConfigured() ? "configured" : "not_connected",
    supabase: isSupabaseConfigured() ? "configured" : "not_connected",
  });
}
