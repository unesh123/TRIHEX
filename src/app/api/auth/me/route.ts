import { NextResponse } from "next/server";
import { getCurrentStorefrontUser } from "@/lib/auth/user-session";
import { getVipMemberRecordByEmail } from "@/lib/vip/vip-member-store";
import { isOwnerEmail } from "@/lib/auth/owner";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentStorefrontUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const vipRecord = user.email ? await getVipMemberRecordByEmail(user.email) : null;
    const isOwner = isOwnerEmail(user.email);

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        isOwner,
        role: isOwner ? "SUPER_ADMIN" : user.role || "CUSTOMER",
        customerCode: vipRecord?.verificationToken || user.customerCode,
        phone: vipRecord?.phone || user.phone,
        vipStatus: isOwner ? "ACTIVE" : vipRecord?.status || "NONE",
        vipTag: isOwner ? "OWNER" : vipRecord?.vipTag || "NORMAL",
        isLifetime: isOwner ? true : vipRecord?.isLifetime || false,
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
