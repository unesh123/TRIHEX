import { AccountShell } from "@/components/storefront/account-shell";

interface AccountOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const { id } = await params;

  return (
    <AccountShell
      title={`Order ${id}`}
      description="Detailed order view requires sign-in."
    />
  );
}
