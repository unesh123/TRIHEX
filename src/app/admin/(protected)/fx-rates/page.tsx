import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { getSectionMeta } from "@/lib/admin/sections";

const meta = getSectionMeta("fx-rates");

export default function FxRatesPage() {
  return (
    <AdminSectionPage {...meta}>
      <div className="rounded-xl border border-border bg-surface/60 p-5 text-sm text-text-muted">
        Default operational rate for Gemini example:{" "}
        <strong className="text-text">160 NPR/USD</strong>. Persist FX tables when
        DATABASE_URL is connected.
      </div>
    </AdminSectionPage>
  );
}
