import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { TrackOrderForm } from "@/components/storefront/track-order-form";

export const dynamic = "force-dynamic";

interface TrackOrderPageProps {
  searchParams: Promise<{ orderNumber?: string; phone?: string }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { orderNumber, phone } = await searchParams;

  return (
    <StorefrontPageShell
      title="Track Order & VIP Status"
      description="Enter your Nepali mobile number or order number to track your VIP clearance, payment verification, and delivery timeline."
    >
      <TrackOrderForm initialOrderNumber={orderNumber ?? ""} initialPhone={phone ?? ""} />
    </StorefrontPageShell>
  );
}
