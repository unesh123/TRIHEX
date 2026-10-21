import { describe, it, expect } from "vitest";
import {
  getAllVipOrders,
  updateVipOrderStatus,
  approveVipOrderAndActivateMember,
} from "@/lib/vip/vip-order-store";
import {
  getAllVipMembers,
  getVipMemberByPhone,
  toggleVipLock,
  allocateVipBonus,
} from "@/lib/vip/vip-member-store";

describe("VIP Orders & Control Center Intelligence", () => {
  it("retrieves VIP orders including 1-Month, 6-Month, and Lifetime tiers", async () => {
    const orders = await getAllVipOrders();
    expect(orders.length).toBeGreaterThanOrEqual(3);

    const lifetime = orders.find((o) => o.tier === "LIFETIME");
    expect(lifetime).toBeDefined();
    expect(lifetime?.amountNpr).toBe(7999);
    expect(lifetime?.customerPhone).toBeDefined();

    const sixMonths = orders.find((o) => o.tier === "6_MONTHS");
    expect(sixMonths).toBeDefined();
    expect(sixMonths?.amountNpr).toBe(5999);

    const oneMonth = orders.find((o) => o.tier === "1_MONTH");
    expect(oneMonth).toBeDefined();
    expect(oneMonth?.amountNpr).toBe(3999);
  });

  it("modifies VIP order status between PROCESSING, PAID, and FULFILLED", async () => {
    const orders = await getAllVipOrders();
    const orderToUpdate = orders[0];
    expect(orderToUpdate).toBeDefined();

    const updated = await updateVipOrderStatus(
      orderToUpdate.id,
      "PROCESSING",
      "Manual audit note: verifying bank screenshot"
    );
    expect(updated).not.toBeNull();
    expect(updated?.orderStatus).toBe("PROCESSING");
    expect(updated?.paymentStatus).toBe("UNDER_REVIEW");

    // Change to PAID
    const paid = await updateVipOrderStatus(orderToUpdate.id, "PAID");
    expect(paid?.orderStatus).toBe("PAID");
    expect(paid?.paymentStatus).toBe("PAID");
  });

  it("1-click approves VIP order, activates member clearance, and allocates bonuses", async () => {
    const testOrderId = "ord-vip-life-001";
    const result = await approveVipOrderAndActivateMember(testOrderId, {
      bonusDays: 30,
      bonusPerk: "Priority Founder Hotline & Uncapped AI Leaks",
      customTag: "VIP",
      adminNotes: "Bank QR payment confirmed by admin.",
    });

    expect(result.order).not.toBeNull();
    expect(result.order?.orderStatus).toBe("FULFILLED");
    expect(result.order?.paymentStatus).toBe("PAID");
    expect(result.order?.isMemberActive).toBe(true);

    expect(result.member).not.toBeNull();
    expect(result.member?.status).toBe("ACTIVE");
    expect(result.member?.vipTag).toBe("VIP");
    expect(result.member?.bonusDays).toBeGreaterThanOrEqual(30);
    expect(result.member?.bonusPerks).toContain("Priority Founder Hotline & Uncapped AI Leaks");
  });

  it("handles advanced cryptographic locking and freeze clearance", async () => {
    const members = await getAllVipMembers();
    const candidate = members.find((m) => m.phone === "9841399201");
    expect(candidate).toBeDefined();

    if (candidate) {
      // 1. Lock Clearance
      const locked = await toggleVipLock(
        candidate.id,
        true,
        "Suspicious IP hopping detected by security sentinel"
      );
      expect(locked).not.toBeNull();
      expect(locked?.isLocked).toBe(true);
      expect(locked?.status).toBe("SUSPENDED");
      expect(locked?.cipherLockHash).toContain("THX-AES256");
      expect(locked?.lockReason).toContain("Suspicious IP hopping");

      // Verify via phone lookup
      const lookupLocked = await getVipMemberByPhone(candidate.phone);
      expect(lookupLocked?.isLocked).toBe(true);

      // 2. Unlock Clearance
      const unlocked = await toggleVipLock(candidate.id, false);
      expect(unlocked).not.toBeNull();
      expect(unlocked?.isLocked).toBe(false);
      expect(unlocked?.status).toBe("ACTIVE");
      expect(unlocked?.lockedAt).toBeNull();
    }
  });

  it("allocates custom VIP bonuses and extends member validity", async () => {
    const members = await getAllVipMembers();
    const member = members.find((m) => m.phone === "9818442099");
    expect(member).toBeDefined();

    if (member) {
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
    }
  });
});
