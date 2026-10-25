import { NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { appendAuditEvent } from "@/lib/audit/log";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";
import { fetchNepalSeismicEvents } from "@/lib/nepal/earthquake-adapter";
import { fetchNepalAirQualityFeed } from "@/lib/nepal/air-quality-adapter";
import { checkDealExpirations, getAllDealCandidates } from "@/lib/deals/store";
import { getAllVipOrders } from "@/lib/vip/vip-order-store";
import { getAllVipMembers } from "@/lib/vip/vip-member-store";
import { getAllVipVaultItems } from "@/lib/vip/vip-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await checkAdminSession(new Headers(request.headers));
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized operator access" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const [forexRes, seismicRes, aqiRes, dealsSyncRes, vipOrdersRes, vipMembersRes] =
      await Promise.allSettled([
        fetchNrbForexRates(),
        fetchNepalSeismicEvents(),
        fetchNepalAirQualityFeed(),
        Promise.resolve(checkDealExpirations()),
        getAllVipOrders(true),
        getAllVipMembers(),
      ]);

    const forex = forexRes.status === "fulfilled" ? forexRes.value : null;
    const seismic = seismicRes.status === "fulfilled" ? seismicRes.value : null;
    const aqi = aqiRes.status === "fulfilled" ? aqiRes.value : null;
    const allDeals = getAllDealCandidates();
    const vipOrders = vipOrdersRes.status === "fulfilled" ? vipOrdersRes.value : [];
    const vipMembers = vipMembersRes.status === "fulfilled" ? vipMembersRes.value : [];
    const vipVault = getAllVipVaultItems();

    const durationMs = Date.now() - startTime;

    try {
      await appendAuditEvent({
        action: "SYSTEM_EVENT",
        actorId: gate.session.email || "admin-operator",
        entityType: "live_scraper",
        metadata: {
          action: "24_7_RADAR_SCRAPE_TRIGGERED",
          durationMs,
          ordersCount: vipOrders.length,
          membersCount: vipMembers.length,
          forexLive: forex?.isLive ?? false,
          seismicEvents: seismic?.events?.length ?? 0,
        },
      });
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      radarStatus: "ONLINE_24_7",
      timestamp: new Date().toISOString(),
      durationMs,
      boards: {
        ordersBoard: {
          title: "VIP Package Orders Board",
          status: "LIVE_ACTIVE",
          total: vipOrders.length,
          pendingReview: vipOrders.filter(
            (o) => o.paymentStatus === "UNDER_REVIEW" || o.orderStatus === "PROCESSING"
          ).length,
          paidCount: vipOrders.filter((o) => o.paymentStatus === "PAID").length,
        },
        membersBoard: {
          title: "VIP Member Control Center Board",
          status: "LIVE_ACTIVE",
          total: vipMembers.length,
          activeCount: vipMembers.filter((m) => m.status === "ACTIVE").length,
          lockedCount: vipMembers.filter((m) => m.isLocked).length,
        },
        vaultBoard: {
          title: "VIP Exclusive Vault Board",
          status: "LIVE_ACTIVE",
          total: vipVault.length,
          workingCount: vipVault.filter((v) => v.isWorking).length,
        },
      },
      scrapers: {
        forex: {
          status: forex?.isLive ? "LIVE_SCRAPED" : "CACHED_BASELINE",
          date: forex?.date,
          usdRate: forex?.rates?.find((r) => r.currency === "USD")?.buy ?? 136.5,
        },
        seismic: {
          status: seismic?.isLive ? "LIVE_USGS" : "STABLE",
          eventsMonitored: seismic?.events?.length ?? 0,
        },
        airQuality: {
          status: aqi?.status === "LIVE" ? "LIVE_MONITORED" : "BASELINE",
          stationsCount: aqi?.data?.stations?.length ?? 0,
        },
        dealRadar: {
          status: "CONTINUOUS_MONITOR",
          totalDiscovered: allDeals.length,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Live scrape execution failed." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
