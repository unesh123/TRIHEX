/**
 * MFA policy for admin.
 *
 * Soft by default so the owner is never locked out of a working shop.
 * Hard enforce only when ADMIN_MFA_REQUIRED=true (or ADMIN_MFA_OPTIONAL=false).
 */

export function isMfaHardRequired(): boolean {
  if (
    process.env.ADMIN_MFA_OPTIONAL === "true" ||
    process.env.ADMIN_MFA_OPTIONAL === "1"
  ) {
    return false;
  }
  if (
    process.env.ADMIN_MFA_REQUIRED === "true" ||
    process.env.ADMIN_MFA_REQUIRED === "1"
  ) {
    return true;
  }
  // Explicit opt-in to old "optional=false means required" behavior
  if (
    process.env.ADMIN_MFA_OPTIONAL === "false" ||
    process.env.ADMIN_MFA_OPTIONAL === "0"
  ) {
    return true;
  }
  return false;
}

export function isPrivilegedAdminRole(role: string): boolean {
  return [
    "SUPER_ADMIN",
    "ADMIN",
    "FINANCE",
    "COMPLIANCE_REVIEWER",
  ].includes(role);
}
