import { AdminHeader } from "@/components/admin/admin-header";
import { VipHubTabs } from "@/components/admin/vip-hub-tabs";
import { getAllVipVaultItems } from "@/lib/vip/vip-store";
import { getAllVipMembers } from "@/lib/vip/vip-member-store";
import { getAllVipOrders } from "@/lib/vip/vip-order-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VIP Control Center & Member Intelligence · TRIHEX Admin",
  description:
    "Live VIP orders feed, status modification, member clearance by phone number, cryptographic locking, VIP bonuses, and exclusive VIP Vault drops.",
};

export default async function AdminVipPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: "orders" | "members" | "vault" }>;
}) {
  const params = await searchParams;
  const [vaultItems, vipMembers, vipOrders] = await Promise.all([
    getAllVipVaultItems(),
    getAllVipMembers(),
    getAllVipOrders(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="VIP Control Center & Member Intelligence"
        description="Launched by Trix · Manage VIP package orders, 1-click status switcher, member clearance by phone number, cryptographic locking, and exclusive VIP bonuses."
      />

      <VipHubTabs
        initialMembers={vipMembers}
        initialVaultItems={vaultItems}
        initialOrders={vipOrders}
        defaultTab={params.tab || "orders"}
      />
    </div>
  );
}
