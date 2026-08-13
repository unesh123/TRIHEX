import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { getRecentAuditEvents } from "@/lib/audit/log";

export default async function AuditPage() {
  const events = await getRecentAuditEvents(100);

  return (
    <AdminSectionPage
      title="Audit log"
      description="Immutable admin activity trail from the active persistence layer (PostgreSQL when connected)."
    >
      <DataTableShell title="Recent events">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Actor</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No audit events yet.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-xs tabular-nums text-text-muted">
                    {new Date(e.createdAt).toLocaleString("en-NP")}
                  </td>
                  <td className="px-4 py-3">{e.action}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {e.entityType}
                    {e.entityId ? ` · ${e.entityId}` : ""}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {e.actorId ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableShell>
    </AdminSectionPage>
  );
}
