import { AdminHeader } from "@/components/admin/admin-header";
import { FinancialReportDashboard } from "@/components/admin/financial-report-dashboard";
import { getFinancialReportData } from "@/lib/admin/financial-reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report = await getFinancialReportData({ days: 9999 });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Financial & P&L Reports"
        description="Audited profit, revenue, and settlement reports from verified customer payments"
      />
      <FinancialReportDashboard initialReport={report} />
    </div>
  );
}
