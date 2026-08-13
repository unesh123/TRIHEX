import Link from "next/link";
import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { isAdminModuleEnabled } from "@/lib/admin/module-flags";

const SETTINGS_LINKS = [
  {
    href: "/admin/settings/security",
    label: "Security / MFA",
    module: "settings_security" as const,
    ready: true,
  },
  {
    href: "/admin/payment-methods",
    label: "Payment methods (QR)",
    module: "payment_methods" as const,
    ready: true,
  },
  // Remaining settings shells stay off the hub until implemented
] as const;

export default function SettingsPage() {
  const links = SETTINGS_LINKS.filter(
    (l) => l.ready && isAdminModuleEnabled(l.module),
  );

  return (
    <AdminSectionPage
      title="Settings"
      description="Only configured, working settings are listed. Unfinished modules stay hidden."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-lg border border-border bg-surface/60 px-4 py-3 text-sm text-text hover:border-primary/40"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-text-muted">
        WhatsApp number, FX, and business profile editors arrive in P1 — they are
        not shown until database-backed.
      </p>
    </AdminSectionPage>
  );
}
