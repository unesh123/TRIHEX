import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { TrackOrderForm } from "@/components/storefront/track-order-form";

export const dynamic = "force-dynamic";

interface TrackOrderPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { orderNumber } = await searchParams;

  return (
    <StorefrontPageShell
      title="Track order"
      description="Enter your order number and the email or phone used at checkout."
    >
      <TrackOrderForm initialOrderNumber={orderNumber ?? ""} />
    </StorefrontPageShell>
  );
}
