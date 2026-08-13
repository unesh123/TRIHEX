import { getWhatsAppDisplay } from "@/lib/whatsapp";

const ITEMS = [
  {
    title: "eSewa · Khalti · Bank QR",
    body: "Pay with the same checkout QR — upload screenshot for verification.",
  },
  {
    title: `WhatsApp ${getWhatsAppDisplay()}`,
    body: "Human support for availability, payment questions, and delivery.",
  },
  {
    title: "Admin-verified delivery",
    body: "We approve payment before activating and delivering your package.",
  },
  {
    title: "Typical delivery ETA",
    body: "Usually within a few hours after payment is verified (business hours).",
  },
] as const;

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Trust and delivery"
      className={
        compact
          ? "rounded-2xl border border-[var(--border)] bg-[var(--page-soft)] px-4 py-3"
          : "rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-[0_8px_24px_var(--shadow)] sm:px-5"
      }
    >
      <ul
        className={
          compact
            ? "grid gap-3 sm:grid-cols-2"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {ITEMS.map((item) => (
          <li key={item.title}>
            <p className="text-xs font-semibold text-[var(--text)] sm:text-sm">
              {item.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)] sm:text-xs">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
