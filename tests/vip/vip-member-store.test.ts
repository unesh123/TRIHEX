import { describe, it, expect } from "vitest";
import {
  getAllVipMembers,
  searchVipMembers,
  getVipMemberByPhone,
  getVipMemberByEmail,
  grantVipAccess,
  revokeVipAccess,
  registerOrUpdateCustomerVip,
  getVipTagMetadata,
  deleteVipMember,
} from "@/lib/vip/vip-member-store";

describe("VIP Member & Customer Intelligence Store", () => {
  it("retrieves baseline VIP members with complete profile intelligence", async () => {
    const members = await getAllVipMembers();
    expect(members.length).toBeGreaterThanOrEqual(1);

    const founder = members.find((m) => m.id === "vip-founder-trix");
    expect(founder).toBeDefined();
    expect(founder?.isLifetime).toBe(true);
    expect(founder?.phone).toBe("9801970291");
    expect(founder?.status).toBe("ACTIVE");
    expect(founder?.deviceTelemetry).toBeDefined();
  });

  it("searches members by phone number, email, or token", async () => {
    const byPhone = await searchVipMembers("9801970291");
    expect(byPhone.length).toBeGreaterThanOrEqual(1);
    expect(byPhone[0].phone).toContain("9801970291");

    const byEmail = await searchVipMembers("unesh@trihex.digital");
    expect(byEmail.length).toBeGreaterThanOrEqual(1);
  });

  it("grants VIP access by phone number and calculates lifetime vs duration", async () => {
    const testPhone = "9849999888";
    const testEmail = "test.vip.nepal@gmail.com";

    const granted = await grantVipAccess({
      phone: testPhone,
      email: testEmail,
      name: "Siddhartha Giri",
      tier: "1_MONTH",
      expiresDays: 30,
      adminNotes: "Paid via Khalti Ref #KHLT-77291",
    });

    expect(granted.phone).toBe(testPhone);
    expect(granted.email).toBe(testEmail);
    expect(granted.status).toBe("ACTIVE");
    expect(granted.isLifetime).toBe(false);
    expect(granted.expiresAt).not.toBeNull();
    expect(granted.verificationToken).toContain("THX-VIP-1_MONTH");

    // Lookup by phone
    const found = await getVipMemberByPhone(testPhone);
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Siddhartha Giri");

    // Granting Lifetime
    const lifetime = await grantVipAccess({
      phone: testPhone,
      email: testEmail,
      name: "Siddhartha Giri",
      tier: "LIFETIME",
      isLifetime: true,
    });
    expect(lifetime.isLifetime).toBe(true);
    expect(lifetime.expiresAt).toBeNull();
  });

  it("revokes VIP access properly", async () => {
    const phone = "9860111222";
    const member = await grantVipAccess({
      phone,
      email: "revoke.test@gmail.com",
      name: "Revoke Candidate",
      tier: "1_MONTH",
    });

    expect(member.status).toBe("ACTIVE");

    const success = await revokeVipAccess(member.id);
    expect(success).toBe(true);

    const updated = await getVipMemberByPhone(phone);
    expect(updated?.status).toBe("SUSPENDED");
  });

  it("registers customers via mobile phone checkout and assigns tags", async () => {
    const phone = "9812345678";
    const registered = await registerOrUpdateCustomerVip({
      phone,
      name: "Bank QR Customer",
      tier: "1_MONTH",
      status: "PENDING_VERIFICATION",
      amountNpr: 3999,
      verificationToken: "THX-VIP-TEST-QR-99",
    });

    expect(registered.phone).toBe(phone);
    expect(registered.status).toBe("PENDING_VERIFICATION");
    expect(registered.vipTag).toBe("VIP");
    expect(registered.totalSpentNpr).toBe(3999);

    const meta = getVipTagMetadata("VIP");
    expect(meta.label).toBe("TRIHEX VIP ELITE");

    const proMeta = getVipTagMetadata("PRO");
    expect(proMeta.label).toBe("PRO OPERATOR");

    // Purge delete
    const deleted = await deleteVipMember(registered.id);
    expect(deleted).toBe(true);
  });
});
