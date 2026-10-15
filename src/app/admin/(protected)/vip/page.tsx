import { AdminHeader } from "@/components/admin/admin-header";
import { VipVaultManager } from "@/components/admin/vip-vault-manager";
import { getAllVipVaultItems } from "@/lib/vip/vip-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VIP Vault & Balls Manager · TRIHEX Admin",
  description:
    "Manage Launched by Trix VIP balls, unlimited methods, operational statuses, private chatrooms, and cloud resources.",
};

export default function AdminVipPage() {
  const items = getAllVipVaultItems();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="VIP Vault & Balls Manager"
        description="Launched by Trix · Manage elite VIP balls, unlimited methods, operational switches, bold list deliverables, and private community chat rooms."
      />

      <VipVaultManager initialItems={items} />
    </div>
  );
}
