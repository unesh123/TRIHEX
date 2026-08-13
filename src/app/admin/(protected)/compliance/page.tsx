import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Button } from "@/components/ui/button";

export default function CompliancePage() {
  return (
    <AdminSectionPage
      title="Compliance"
      description="Authorization evidence and product compliance posture."
    >
      <Button href="/admin/compliance/reviews" size="sm">
        Open data verification queue
      </Button>
      <p className="mt-4 text-sm text-text-muted">
        Most screenshot-derived listings remain BLOCKED or DRAFT until verified.
      </p>
    </AdminSectionPage>
  );
}
