/**
 * Server-controlled admin module visibility.
 * Production navigation must never point at empty shells.
 *
 * Override with ADMIN_MODULES_EXTRA=comma,list to force-enable extras.
 * Override with ADMIN_MODULES_HIDE=comma,list to force-hide.
 */

export type AdminModuleId =
  | "overview"
  | "orders"
  | "payments"
  | "payments_review"
  | "fulfillment"
  | "products"
  | "products_import"
  | "inventory"
  | "pricing"
  | "compliance"
  | "compliance_reviews"
  | "reviews"
  | "customers"
  | "payment_methods"
  | "audit"
  | "settings"
  | "settings_security"
  // Hidden until fully implemented (P1/P2)
  | "variants"
  | "lots"
  | "movements"
  | "suppliers"
  | "fx_rates"
  | "promotions"
  | "warranties"
  | "refunds"
  | "support"
  | "reports"
  | "team"
  | "legal"
  | "integrations"
  | "system"
  | "marketing"
  | "coupons"
  | "campaigns"
  | "whatsapp_settings"
  | "email_templates";

/** Modules safe to show in Production navigation (P0). */
const P0_ENABLED = new Set<AdminModuleId>([
  "overview",
  "orders",
  "payments_review",
  "products",
  "products_import",
  "pricing",
  "payment_methods",
  "audit",
  "settings_security",
]);

function parseList(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function isAdminModuleEnabled(id: AdminModuleId): boolean {
  const hide = parseList(process.env.ADMIN_MODULES_HIDE);
  if (hide.has(id)) return false;
  const extra = parseList(process.env.ADMIN_MODULES_EXTRA);
  if (extra.has(id)) return true;
  return P0_ENABLED.has(id);
}

export function enabledAdminModules(): AdminModuleId[] {
  const all = [
    ...P0_ENABLED,
    ...parseList(process.env.ADMIN_MODULES_EXTRA),
  ] as AdminModuleId[];
  return [...new Set(all)].filter((id) => isAdminModuleEnabled(id));
}
