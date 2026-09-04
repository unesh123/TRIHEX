import type { Permission } from "@/lib/auth/permissions";
import { hasPermission, type AppRole } from "@/lib/auth/permissions";
import {
  isAdminModuleEnabled,
  type AdminModuleId,
} from "@/lib/admin/module-flags";

export interface AdminNavItem {
  href: string;
  label: string;
  module: AdminModuleId;
  permission?: Permission;
  roleLabels?: Partial<Record<AppRole, string>>;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

const NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", module: "overview" }],
  },
  {
    id: "intelligence",
    label: "Intelligence OS",
    items: [
      { href: "/admin/deal-radar", label: "Deal Radar", module: "deal_radar", permission: "products:edit" },
      { href: "/admin/queue", label: "Verification Queue", module: "deal_radar", permission: "products:edit" },
      { href: "/admin/prompts", label: "Prompts & Templates", module: "prompts", permission: "products:edit" },
      { href: "/admin/search-analytics", label: "Search & Demand", module: "search_analytics", permission: "products:edit" },
      { href: "/admin/sources", label: "Sources & Feeds", module: "sources", permission: "settings:manage" },
      { href: "/admin/integrations", label: "Provider Integrations", module: "integrations", permission: "settings:manage" },
      { href: "/admin/usage", label: "AI Usage & Budgets", module: "integrations", permission: "settings:manage" },
      { href: "/admin/system-health", label: "System Health", module: "system_health", permission: "settings:manage" },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { href: "/admin/products", label: "Products", module: "products", permission: "products:edit" },
      {
        href: "/admin/products/import",
        label: "Import (cost→NPR)",
        module: "products_import",
        permission: "products:edit",
      },
      { href: "/admin/pricing", label: "Pricing", module: "pricing", permission: "pricing:edit" },
      {
        href: "/admin/inventory",
        label: "Inventory",
        module: "inventory",
        permission: "inventory:manage",
      },
      { href: "/admin/orders", label: "Orders", module: "orders", permission: "orders:view" },
      { href: "/admin/quotes", label: "Quote requests", module: "quotes", permission: "support:manage" },
      {
        href: "/admin/fulfillment",
        label: "Fulfillment",
        module: "fulfillment",
        permission: "orders:fulfill",
        roleLabels: { FULFILLMENT: "My queue" },
      },
      {
        href: "/admin/payments/review",
        label: "Payment review",
        module: "payments_review",
        permission: "payments:review",
      },
      {
        href: "/admin/payments",
        label: "Payments",
        module: "payments",
        permission: "payments:review",
      },
      {
        href: "/admin/payment-methods",
        label: "Payment methods",
        module: "payment_methods",
        permission: "payments:review",
      },
    ],
  },
  {
    id: "customer-care",
    label: "Customer care",
    items: [
      {
        href: "/admin/customers",
        label: "Customers",
        module: "customers",
        permission: "customers:view",
      },
      {
        href: "/admin/reviews",
        label: "Reviews",
        module: "reviews",
        permission: "products:edit",
      },
      {
        href: "/admin/warranties",
        label: "Warranty claims",
        module: "warranties",
        permission: "orders:view",
      },
      {
        href: "/admin/refunds",
        label: "Refunds",
        module: "refunds",
        permission: "orders:refund",
      },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    items: [
      {
        href: "/admin/compliance/reviews",
        label: "Compliance",
        module: "compliance_reviews",
        permission: "compliance:review",
      },
      {
        href: "/admin/audit",
        label: "Audit log",
        module: "audit",
        permission: "audit:view",
      },
      {
        href: "/admin/settings/security",
        label: "Security / MFA",
        module: "settings_security",
        permission: "settings:manage",
      },
      {
        href: "/admin/settings",
        label: "Settings",
        module: "settings",
        permission: "settings:manage",
      },
      {
        href: "/admin/team",
        label: "Team & roles",
        module: "team",
        permission: "team:manage",
      },
      {
        href: "/admin/reports",
        label: "Reports",
        module: "reports",
        permission: "reports:view",
      },
    ],
  },
];

export function navGroupsForRole(role: AppRole): AdminNavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => {
        if (!isAdminModuleEnabled(item.module)) return false;
        if (!item.permission) return true;
        return hasPermission(role, item.permission);
      })
      .map((item) => ({
        ...item,
        label: item.roleLabels?.[role] ?? item.label,
      })),
  })).filter((g) => g.items.length > 0);
}

/** Flat list for callers that still expect an array */
export function navItemsForRole(role: AppRole): AdminNavItem[] {
  return navGroupsForRole(role).flatMap((g) => g.items);
}

/** @deprecated use navGroupsForRole — kept for any leftover imports */
export const ADMIN_NAV: AdminNavItem[] = NAV_GROUPS.flatMap((g) => g.items);
