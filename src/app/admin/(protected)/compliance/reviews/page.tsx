import Link from "next/link";
import { desc, eq, ne, or } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatusPill } from "@/components/admin/admin-section-page";
import { DbUnavailable } from "@/components/admin/db-unavailable";
import { getAdminDbOrMessage } from "@/lib/admin/safe-db";
import * as schema from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ComplianceReviewsPage() {
  const readyDb = getAdminDbOrMessage();
  if (!readyDb.ok) {
    return (
      <DbUnavailable title="Compliance queue" message={readyDb.message} />
    );
  }
  const db = readyDb.db;

  let queue: Array<{
    id: string;
    slug: string;
    name: string;
    productStatus: string;
    complianceStatus: string;
    needsDataVerification: boolean;
  }> = [];

  try {
    queue = await db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
        name: schema.products.name,
        productStatus: schema.products.productStatus,
        complianceStatus: schema.products.complianceStatus,
        needsDataVerification: schema.products.needsDataVerification,
      })
      .from(schema.products)
      .where(
        or(
          ne(schema.products.complianceStatus, "APPROVED"),
          eq(schema.products.needsDataVerification, true),
          eq(schema.products.productStatus, "DRAFT"),
          eq(schema.products.productStatus, "BLOCKED"),
        ),
      )
      .orderBy(desc(schema.products.updatedAt))
      .limit(300);
  } catch (e) {
    return (
      <DbUnavailable
        title="Compliance queue"
        message={e instanceof Error ? e.message : "Query failed"}
      />
    );
  }

  const actionable = queue.filter((p) => p.productStatus !== "ARCHIVED");

  return (
    <>
      <AdminHeader
        title="Compliance queue"
        description="Live products that are not fully approved or need data verification."
      />
      <DataTableShell title={`Needs review (${actionable.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-raised/50 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Store status</th>
                <th className="px-4 py-3">Compliance</th>
                <th className="px-4 py-3">Data check</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {actionable.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-text-muted"
                  >
                    No products currently need compliance review.
                  </td>
                </tr>
              ) : (
                actionable.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-text-muted">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={p.productStatus}
                        variant={
                          p.productStatus === "PUBLIC" ? "success" : "warning"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={p.complianceStatus}
                        variant={
                          p.complianceStatus === "APPROVED"
                            ? "success"
                            : "danger"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.needsDataVerification ? "Needs verification" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Open product →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataTableShell>
    </>
  );
}
