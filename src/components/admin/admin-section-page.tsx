import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { isDatabaseConfigured } from "@/lib/env";
import type { AdminSectionMeta } from "@/lib/admin/sections";

interface AdminSectionPageProps extends AdminSectionMeta {
  children?: React.ReactNode;
}

export function AdminSectionPage({
  title,
  description,
  demoNote,
  children,
}: AdminSectionPageProps) {
  return (
    <>
      <AdminHeader title={title} description={description} />
      {!isDatabaseConfigured() ? (
        <div className="mb-6 rounded-lg border border-border bg-surface-raised/50 px-4 py-3 text-sm text-text-muted">
          {demoNote ??
            "Showing seed/demo placeholders. Connect DATABASE_URL to persist changes."}
        </div>
      ) : null}
      {children ?? (
        <div className="rounded-xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center text-sm text-text-muted">
          This section is not enabled in navigation until it is fully wired.
        </div>
      )}
    </>
  );
}

export function StatusPill({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  return <Badge variant={variant}>{label}</Badge>;
}
