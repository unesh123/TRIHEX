import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--primary-soft)] text-center text-xs text-[var(--text-secondary)] sm:text-sm">
      <p className="store-container py-2.5">
        Nepal-friendly digital pricing • Website order tracking • Local WhatsApp
        support{" "}
        <Link
          href="/pricing-transparency"
          className="font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
        >
          See how we price
        </Link>
        {" · "}
        <Link
          href="/verified-supply"
          className="font-semibold text-[var(--text)] underline-offset-2 hover:text-[var(--primary)] hover:underline"
        >
          Authorization policy
        </Link>
      </p>
    </div>
  );
}
