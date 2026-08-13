import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { getSectionMeta } from "@/lib/admin/sections";

export default function InventoryMovementsPage() {
  return <AdminSectionPage {...getSectionMeta("inventory-movements")} />;
}
