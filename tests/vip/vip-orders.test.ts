import { describe, it, expect } from "vitest";
import {
  getAllVipOrders,
  createVipOrder,
  updateVipOrderStatus,
  approveVipOrderAndActivateMember,
  changeVipOrderTier,
} from "@/lib/vip/vip-order-store";
import {
  getAllVipMembers,
  getVipMemberByPhone,
  toggleVipLock,
  allocateVipBonus,
  registerOrUpdateCustomerVip,
} from "@/lib/vip/vip-member-store";

describe("VIP Orders & Control Center Intelligence", () => {
  it("creates and retrieves VIP orders across 1-Month, 6-Month, and Lifetime tiers", async () => {
    // Dynamically create test orders
    const ord1 = await createVipOrder({
      customerName: "Test Life VIP",
      customerPhone: "9800000001",
      customerEmail: "life.test@trihexdigital.com",
      tier: "LIFETIME",
      amountNpr: 7999,
      paymentMethod: "BANK_TRANSFER",
    });

    const ord2 = await createVipOrder({
      customerName: "Test 6M VIP",
      customerPhone: "9800000002",
      customerEmail: "sixm.test@trihexdigital.com",
      tier: "6_MONTHS",
      amountNpr: 5999,
      paymentMethod: "ESEWA",
    });

    const ord3 = await createVipOrder({
      customerName: "Test 1M VIP",
      customerPhone: "9800000003",
      customerEmail: "onem.test@trihexdigital.com",
      tier: "1_MONTH",
      amountNpr: 3999,
      paymentMethod: "KHALTI",
    });

    const orders = await getAllVipOrders();
    expect(orders.length).toBeGreaterThanOrEqual(3);

    const lifetime = orders.find((o) => o.id === ord1.id);
    expect(lifetime).toBeDefined();
    expect(lifetime?.amountNpr).toBe(7999);
    expect(lifetime?.tier).toBe("LIFETIME");

    const sixMonths = orders.find((o) => o.id === ord2.id);
    expect(sixMonths).toBeDefined();
    expect(sixMonths?.amountNpr).toBe(5999);
    expect(sixMonths?.tier).toBe("6_MONTHS");

    const oneMonth = orders.find((o) => o.id === ord3.id);
    expect(oneMonth).toBeDefined();
    expect(oneMonth?.amountNpr).toBe(3999);
    expect(oneMonth?.tier).toBe("1_MONTH");
  });

  it("modifies VIP order status between PROCESSING, PAID, and FULFILLED", async () => {
    const testOrder = await createVipOrder({
      customerName: "Status Test User",
      customerPhone: "9800000004",
      customerEmail: "status@trihexdigital.com",
      tier: "1_MONTH",
      amountNpr: 3999,
    });

    const updated = await updateVipOrderStatus(
      testOrder.id,
      "PROCESSING",
      "Manual audit note: verifying bank screenshot"
    );
    expect(updated).not.toBeNull();
    expect(updated?.orderStatus).toBe("PROCESSING");
    expect(updated?.paymentStatus).toBe("UNDER_REVIEW");

    // Change to PAID
    const paid = await updateVipOrderStatus(testOrder.id, "PAID");
    expect(paid?.orderStatus).toBe("PAID");
    expect(paid?.paymentStatus).toBe("PAID");
  });

  it("1-click overrides VIP plan/duration and activates member clearance", async () => {
    // Scenario: Customer ordered 6 Months (Rs. 5,999) but paid only 1 Month (Rs. 3,999)
    const testOrder = await createVipOrder({
      customerName: "Duration Override User",
      customerPhone: "9800000005",
      customerEmail: "override@trihexdigital.com",
      tier: "6_MONTHS",
      amountNpr: 5999,
    });

    // 1. Direct plan change
    const changed = await changeVipOrderTier(testOrder.id, "1_MONTH", {
      adminNotes: "Customer deposited Rs. 3,999 only. Adjusted to 1-Month.",
    });
    expect(changed.order).not.toBeNull();
    expect(changed.order?.tier).toBe("1_MONTH");
    expect(changed.order?.amountNpr).toBe(3999);

    // 2. Approve with override options and bonuses
    const result = await approveVipOrderAndActivateMember(testOrder.id, {
      overrideTier: "1_MONTH",
      overrideAmountNpr: 3999,
      bonusDays: 7,
      bonusPerk: "Fast-Track Setup",
      customTag: "VIP",
      adminNotes: "Approved 1-Month pass with 7 bonus days.",
    });

    expect(result.order).not.toBeNull();
    expect(result.order?.orderStatus).toBe("FULFILLED");
    expect(result.order?.paymentStatus).toBe("PAID");
    expect(result.order?.isMemberActive).toBe(true);
    expect(result.order?.tier).toBe("1_MONTH");

    expect(result.member).not.toBeNull();
    expect(result.member?.status).toBe("ACTIVE");
    expect(result.member?.tier).toBe("1_MONTH");
    expect(result.member?.bonusDays).toBeGreaterThanOrEqual(7);
  });

  it("handles advanced cryptographic locking and freeze clearance", async () => {
    const member = await registerOrUpdateCustomerVip({
      phone: "9800000006",
      name: "Security Sentinel Test",
      email: "sentinel@trihexdigital.com",
      tier: "6_MONTHS",
      status: "ACTIVE",
    });

    // 1. Lock Clearance
    const locked = await toggleVipLock(
      member.id,
      true,
      "Suspicious IP hopping detected by security sentinel"
    );
    expect(locked).not.toBeNull();
    expect(locked?.isLocked).toBe(true);
    expect(locked?.status).toBe("SUSPENDED");
    expect(locked?.cipherLockHash).toContain("THX-AES256");
    expect(locked?.lockReason).toContain("Suspicious IP hopping");

    // Verify via phone lookup
    const lookupLocked = await getVipMemberByPhone("9800000006");
    expect(lookupLocked?.isLocked).toBe(true);

    // 2. Unlock Clearance
    const unlocked = await toggleVipLock(member.id, false);
    expect(unlocked).not.toBeNull();
    expect(unlocked?.isLocked).toBe(false);
    expect(unlocked?.status).toBe("ACTIVE");
    expect(unlocked?.lockedAt).toBeNull();
  });

  it("allocates custom VIP bonuses and extends member validity", async () => {
    const member = await registerOrUpdateCustomerVip({
      phone: "9800000007",
      name: "Bonus Perks Test",
      email: "bonus@trihexdigital.com",
      tier: "1_MONTH",
      status: "ACTIVE",
    });

    const priorBonus = member.bonusDays || 0;
    const priorExp = member.expiresAt ? new Date(member.expiresAt).getTime() : Date.now();

    const upgraded = await allocateVipBonus(
      member.id,
      15,
      "Midjourney Pro Prompts Pack"
    );

    expect(upgraded).not.toBeNull();
    expect(upgraded?.bonusDays).toBe(priorBonus + 15);
    expect(upgraded?.bonusPerks).toContain("Midjourney Pro Prompts Pack");
    expect(upgraded?.expiresAt).not.toBeNull();

    if (upgraded?.expiresAt) {
      const newExp = new Date(upgraded.expiresAt).getTime();
      expect(newExp).toBeGreaterThan(priorExp);
    }
  });
});
