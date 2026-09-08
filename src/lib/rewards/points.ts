/**
 * TRIHEX DIGITAL — Customer Loyalty & Rewards Points Engine
 *
 * Rewarding community actions:
 * - Completed Purchase: +100 points per order
 * - Friend Referral: +500 points
 * - Daily Visit / Login: +10 points
 */

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  perk: string;
  badge: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { name: "Explorer", minPoints: 0, perk: "Standard Vault Access", badge: "BRONZE" },
  { name: "Pro Creator", minPoints: 500, perk: "5% Store Discount & Early Drops", badge: "SILVER" },
  { name: "Elite Member", minPoints: 2000, perk: "VIP Vault Unlocked + WhatsApp Priority", badge: "GOLD" },
  { name: "Founding Partner", minPoints: 5000, perk: "Direct Admin Concierge & 10% Discount", badge: "DIAMOND" },
];

export function calculatePointsForAction(action: "PURCHASE" | "REFERRAL" | "DAILY_LOGIN"): number {
  switch (action) {
    case "PURCHASE":
      return 100;
    case "REFERRAL":
      return 500;
    case "DAILY_LOGIN":
      return 10;
    default:
      return 0;
  }
}

export function getTierForPoints(points: number): LoyaltyTier {
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (points >= LOYALTY_TIERS[i].minPoints) {
      return LOYALTY_TIERS[i];
    }
  }
  return LOYALTY_TIERS[0];
}
