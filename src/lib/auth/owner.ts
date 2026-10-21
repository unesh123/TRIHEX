/**
 * TRIHEX's permanent owner identity & authorization rules.
 * Strictly locks root administrator privileges exclusively to Unesh's verified Google account.
 */
export const TRIHEX_OWNER_EMAIL = "uneshbastola888@gmail.com";
export const TRIHEX_OWNER_NAME = "Unesh Bastola";

export const AUTHORIZED_OWNER_EMAILS = [
  "uneshbastola888@gmail.com",
  "jenok_unesh@kkt.redhat.com",
  "jenokunesh@gmail.com",
] as const;

export function getOwnerEmail(): string {
  return TRIHEX_OWNER_EMAIL;
}

export function assertOwnerBootstrapIdentity(): void {
  const configured = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (configured && !isOwnerEmail(configured)) {
    throw new Error(
      "ADMIN_BOOTSTRAP_EMAIL must match the configured TRIHEX owner identity.",
    );
  }
}

/**
 * Strictly verifies whether an email belongs to the authorized owner/operator.
 * Only Unesh's verified Google accounts (uneshbastola888@gmail.com, jenok_unesh@kkt.redhat.com)
 * have permission to access the admin workspace.
 * Any other account attempting admin access is rejected with a 403 Security Alert.
 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (AUTHORIZED_OWNER_EMAILS.some((e) => e.toLowerCase() === normalized)) {
    return true;
  }
  const envEmails =
    process.env.ADMIN_OWNER_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  return envEmails.includes(normalized);
}
