import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import {
  getAllVipMembers,
  searchVipMembers,
  grantVipAccess,
  revokeVipAccess,
  deleteVipMember,
  updateVipMember,
} from "@/lib/vip/vip-member-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const members = query ? await searchVipMembers(query) : await getAllVipMembers();
  return NextResponse.json({ success: true, members });
}

export async function POST(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      phone,
      email,
      name,
      tier,
      vipTag,
      status,
      isLifetime,
      expiresDays,
      avatarUrl,
      adminNotes,
    } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 },
      );
    }

    const member = await grantVipAccess({
      phone,
      email: email || `${phone.replace(/\D/g, "")}@customer.trihex.digital`,
      name: name || `Customer ${phone.slice(-4)}`,
      tier: tier || "1_MONTH",
      vipTag,
      status: status || "ACTIVE",
      isLifetime: Boolean(isLifetime),
      expiresDays: expiresDays ? Number(expiresDays) : undefined,
      avatarUrl,
      adminNotes,
    });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error("[VipMembersAPI] Grant VIP failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process VIP grant." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Member ID required." }, { status: 400 });
    }

    const updated = await updateVipMember(id, updates);
    return NextResponse.json({ success: true, member: updated });
  } catch (err) {
    console.error("[VipMembersAPI] Update VIP failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update VIP status." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const gate = await checkAdminSession(await headers());
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const purge = searchParams.get("purge") === "true";

  if (!id) {
    return NextResponse.json({ success: false, error: "Member ID required." }, { status: 400 });
  }

  const ok = purge ? await deleteVipMember(id) : await revokeVipAccess(id);
  return NextResponse.json({ success: ok });
}
