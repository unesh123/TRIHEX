/**
 * TRIHEX's permanent owner identity.
 *
 * Deployment may repeat this address in ADMIN_BOOTSTRAP_EMAIL for Supabase's
 * bootstrap script, but application authorization always resolves this owner
 * fallback instead of an unsafe local placeholder.
 */
export const TRIHEX_OWNER_EMAIL = "uneshbastola888@gmail.com";
export const TRIHEX_OWNER_NAME = "Unesh Bastola";

export function getOwnerEmail(): string {
  return TRIHEX_OWNER_EMAIL;
}

/**
 * A deployment can repeat the owner email as ADMIN_BOOTSTRAP_EMAIL, but it may
 * never point bootstrap at a different person.
 */
export function assertOwnerBootstrapIdentity(): void {
  const configured = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (configured && configured !== TRIHEX_OWNER_EMAIL) {
    throw new Error(
      "ADMIN_BOOTSTRAP_EMAIL must match the configured TRIHEX owner identity.",
    );
  }
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.trim().toLowerCase() === TRIHEX_OWNER_EMAIL);
}
