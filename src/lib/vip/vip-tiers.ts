export interface VipPricingTier {
  id: "1_MONTH" | "6_MONTHS" | "LIFETIME";
  slug: string;
  sku: string;
  name: string;
  durationLabel: string;
  priceNpr: number;
  badge: string;
  isPopular?: boolean;
  savingsLabel?: string;
  features: string[];
}

export const VIP_PRICING_TIERS: VipPricingTier[] = [
  {
    id: "1_MONTH",
    slug: "trihex-vip-pass-1-month",
    sku: "THX-VIP-1M",
    name: "1 Month VIP Pass",
    durationLabel: "30 Days Full Access",
    priceNpr: 3999,
    badge: "MONTHLY PASS",
    features: [
      "Everything in Pro — included",
      "Full VIP Zone access (Exclusive Leaks & Setups, Cloud Software, Developer Courses, License Keys & Methods, Mobile Zone, VIP Blueprints & more)",
      "Private Founder / Researcher Hotline access",
      "Private VIP Database & Cloud Archive",
      "Untested fresh drops & beta releases first",
      "VIP Mobile Security & toolkit",
      "Advanced Developer & Defense tools",
      "Curated software configurations & license keys",
      "Exclusive VIP courses & masterclasses",
    ],
  },
  {
    id: "6_MONTHS",
    slug: "trihex-vip-pass-6-months",
    sku: "THX-VIP-6M",
    name: "6 Months VIP Pass",
    durationLabel: "180 Days Full Access",
    priceNpr: 5999,
    badge: "MOST POPULAR",
    isPopular: true,
    savingsLabel: "Save 75% per month vs monthly renewal",
    features: [
      "Everything in Pro — included",
      "Full VIP Zone access (Exclusive Leaks & Setups, Cloud Software, Developer Courses, License Keys & Methods, Mobile Zone, VIP Blueprints & more)",
      "Private Founder / Researcher Hotline access (Priority queue)",
      "Private VIP Database & Cloud Archive (6 months continuous updates)",
      "Untested fresh drops & beta releases first",
      "VIP Mobile Security & toolkit",
      "Advanced Developer & Defense tools",
      "Curated software configurations & license keys",
      "Exclusive VIP courses & masterclasses",
      "Direct 1-on-1 architecture review via Discord/WhatsApp",
    ],
  },
  {
    id: "LIFETIME",
    slug: "trihex-vip-pass-lifetime",
    sku: "THX-VIP-LIFE",
    name: "Lifetime VIP Pack",
    durationLabel: "Permanent Lifetime Access",
    priceNpr: 7999,
    badge: "UNRESTRICTED LIFETIME",
    savingsLabel: "Pay once & keep access forever",
    features: [
      "Everything in Pro — included forever",
      "Full VIP Zone access (Exclusive Leaks & Setups, Cloud Software, Developer Courses, License Keys & Methods, Mobile Zone, VIP Blueprints & more)",
      "Direct Founder / Researcher Hotline access (Zero cooldown priority)",
      "Private VIP Database & Cloud Archive (Permanent lifetime sync)",
      "Untested fresh drops & beta releases first (First wave access)",
      "VIP Mobile Security & toolkit (All future version updates)",
      "Advanced Developer & Defense tools (All commercial rights)",
      "Curated software configurations & license keys",
      "Exclusive VIP courses & masterclasses (All future cohorts)",
      "VIP Alpha Guild membership in Private Founder Lounge & Discord",
    ],
  },
];
