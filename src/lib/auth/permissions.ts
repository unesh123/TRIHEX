/**
 * Role-based access control — least privilege.
 */

export const CustomerRole = {
  GUEST: "GUEST",
  CUSTOMER: "CUSTOMER",
} as const;

export const AdminRole = {
  SUPPORT: "SUPPORT",
  FULFILLMENT: "FULFILLMENT",
  CATALOG_MANAGER: "CATALOG_MANAGER",
  FINANCE: "FINANCE",
  COMPLIANCE_REVIEWER: "COMPLIANCE_REVIEWER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];
export type AppRole = "GUEST" | "CUSTOMER" | AdminRole;

export type Permission =
  | "orders:view"
  | "orders:fulfill"
  | "orders:refund"
  | "payments:review"
  | "payments:view_costs"
  | "products:edit"
  | "products:publish"
  | "compliance:review"
  | "compliance:upload_proof"
  | "inventory:manage"
  | "pricing:edit"
  | "pricing:view_margins"
  | "customers:view"
  | "support:manage"
  | "reports:view"
  | "reports:profit"
  | "audit:view"
  | "team:manage"
  | "settings:manage"
  | "legal:manage"
  | "system:manage";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPPORT: [
    "orders:view",
    "customers:view",
    "support:manage",
  ],
  FULFILLMENT: [
    "orders:view",
    "orders:fulfill",
    "inventory:manage",
    "customers:view",
  ],
  CATALOG_MANAGER: [
    "products:edit",
    "compliance:upload_proof",
    "inventory:manage",
    "orders:view",
  ],
  FINANCE: [
    "orders:view",
    "orders:refund",
    "payments:review",
    "payments:view_costs",
    "pricing:view_margins",
    "reports:view",
    "reports:profit",
  ],
  COMPLIANCE_REVIEWER: [
    "compliance:review",
    "products:edit",
    "orders:view",
    "audit:view",
  ],
  ADMIN: [
    "orders:view",
    "orders:fulfill",
    "orders:refund",
    "payments:review",
    "payments:view_costs",
    "products:edit",
    "products:publish",
    "compliance:review",
    "compliance:upload_proof",
    "inventory:manage",
    "pricing:edit",
    "pricing:view_margins",
    "customers:view",
    "support:manage",
    "reports:view",
    "reports:profit",
    "audit:view",
    "settings:manage",
    "legal:manage",
  ],
  SUPER_ADMIN: [
    "orders:view",
    "orders:fulfill",
    "orders:refund",
    "payments:review",
    "payments:view_costs",
    "products:edit",
    "products:publish",
    "compliance:review",
    "compliance:upload_proof",
    "inventory:manage",
    "pricing:edit",
    "pricing:view_margins",
    "customers:view",
    "support:manage",
    "reports:view",
    "reports:profit",
    "audit:view",
    "team:manage",
    "settings:manage",
    "legal:manage",
    "system:manage",
  ],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  if (role === "GUEST" || role === "CUSTOMER") return false;
  return ROLE_PERMISSIONS[role as AdminRole]?.includes(permission) ?? false;
}

export function assertPermission(role: AppRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: role ${role} lacks permission ${permission}`);
  }
}

export function isAdminRole(role: AppRole): boolean {
  return Object.values(AdminRole).includes(role as AdminRole);
}

/**
 * Catalog managers cannot approve their own compliance uploads.
 */
export function canApproveOwnComplianceUpload(
  role: AppRole,
  uploaderId: string,
  reviewerId: string,
): boolean {
  if (uploaderId === reviewerId && role === "CATALOG_MANAGER") return false;
  return hasPermission(role, "compliance:review");
}
