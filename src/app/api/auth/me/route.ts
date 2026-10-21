import { NextResponse } from "next/server";
import { getCurrentStorefrontUser } from "@/lib/auth/user-session";
import { getVipMemberRecordByEmail } from "@/lib/vip/vip-member-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentStorefrontUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const vipRecord = user.email ? await getVipMemberRecordByEmail(user.email) : null;

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        customerCode: vipRecord?.verificationToken || user.customerCode,
        phone: vipRecord?.phone || user.phone,
        vipStatus: vipRecord?.status || "NONE",
        vipTag: vipRecord?.vipTag || "NORMAL",
        isLifetime: vipRecord?.isLifetime || false,
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
