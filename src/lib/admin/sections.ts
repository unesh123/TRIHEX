export interface AdminSectionMeta {
  title: string;
  description: string;
  demoNote?: string;
}

export const ADMIN_SECTIONS: Record<string, AdminSectionMeta> = {
  customers: {
    title: "Customers",
    description: "Customer profiles, order history, and contact preferences.",
  },
  support: {
    title: "Support",
    description: "Support tickets and WhatsApp handoff queue.",
  },
  warranties: {
    title: "Warranties",
    description: "Warranty claims and fulfillment follow-ups.",
  },
  refunds: {
    title: "Refunds",
    description: "Refund requests and finance approval workflow.",
  },
  reviews: {
    title: "Product reviews",
    description: "Moderate storefront reviews before publication.",
  },
  reports: {
    title: "Reports",
    description: "Operational and finance exports from verified payments.",
  },
  audit: {
    title: "Audit log",
    description: "Immutable admin action trail from the active persistence layer.",
  },
  team: {
    title: "Team",
    description: "Admin users, roles, and least-privilege assignments.",
  },
  variants: {
    title: "Variants",
    description: "SKU-level pricing, duration, and stock attributes.",
  },
  suppliers: {
    title: "Suppliers",
    description: "Supplier contacts, authorization evidence, and lot sources.",
  },
  promotions: {
    title: "Promotions",
    description: "Campaign pricing rules and storefront badges.",
  },
  legal: {
    title: "Legal",
    description: "Terms, privacy, and compliance copy for the storefront.",
  },
  integrations: {
    title: "Integrations",
    description: "Third-party connectors (payments, email, analytics).",
  },
  system: {
    title: "System",
    description: "Health checks, feature flags, and maintenance mode.",
  },
  fulfillment: {
    title: "Fulfillment",
    description: "Orders awaiting manual activation or license delivery.",
  },
  "inventory-lots": {
    title: "Inventory lots",
    description: "Received batches linked to supplier authorization.",
  },
  "inventory-movements": {
    title: "Inventory movements",
    description: "Ledger of receive, reserve, sell, and correction events.",
  },
  "inventory-reconciliation": {
    title: "Inventory reconciliation",
    description: "Compare derived available-to-sell with physical counts.",
  },
  "fx-rates": {
    title: "FX rates",
    description: "Owner-controlled NPR/USD rates used by the pricing engine.",
  },
  "payments-review": {
    title: "Payment review",
    description: "Manual proof verification queue (eSewa, Khalti, bank).",
  },
  "compliance-reviews": {
    title: "Data verification",
    description: "Products flagged needsDataVerification from seed catalogue.",
  },
  marketing: {
    title: "Marketing",
    description: "Campaign overview and channel performance (demo).",
  },
  "marketing-campaigns": {
    title: "Campaigns",
    description: "Scheduled campaigns and audience segments.",
  },
  "marketing-media": {
    title: "Marketing media",
    description: "Approved creative assets for ads and storefront.",
  },
  "marketing-coupons": {
    title: "Coupons",
    description: "Discount codes with usage limits and expiry.",
  },
  settings: {
    title: "Settings",
    description: "Business configuration hub — sub-pages for each domain.",
  },
  "settings-business": {
    title: "Business profile",
    description: "Legal name, support contacts, and operating hours.",
  },
  "settings-storefront": {
    title: "Storefront",
    description: "Homepage modules, featured products, and announcements.",
  },
  "settings-whatsapp": {
    title: "WhatsApp",
    description: "Business number and safe message templates.",
  },
  "settings-payments": {
    title: "Payment settings",
    description: "Gateway credentials and manual proof policies.",
  },
  "settings-orders": {
    title: "Order settings",
    description: "Order numbering, TTL, and auto-cancel rules.",
  },
  "settings-inventory": {
    title: "Inventory settings",
    description: "Low-stock thresholds and reservation TTL.",
  },
  "settings-pricing": {
    title: "Pricing settings",
    description: "Default margins, rounding, and allowance policies.",
  },
  "settings-legal": {
    title: "Legal settings",
    description: "Policy URLs and mandatory checkout disclaimers.",
  },
  "settings-security": {
    title: "Security",
    description: "Session policies, IP hashing, and admin access controls.",
  },
  "settings-integrations": {
    title: "Integration settings",
    description: "API keys and webhook endpoints.",
  },
  "settings-notifications": {
    title: "Notifications",
    description: "Email and admin alert routing.",
  },
  "payment-methods": {
    title: "Payment methods",
    description: "Upload cropped, approved QR codes to private storage.",
  },
};

export function getSectionMeta(key: string): AdminSectionMeta {
  return (
    ADMIN_SECTIONS[key] ?? {
      title: "Admin",
      description: "TRIHEX DIGITAL control center section.",
    }
  );
}
