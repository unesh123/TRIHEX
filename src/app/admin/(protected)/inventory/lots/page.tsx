import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { getSectionMeta } from "@/lib/admin/sections";

export default function InventoryLotsPage() {
  return <AdminSectionPage {...getSectionMeta("inventory-lots")} />;
}
