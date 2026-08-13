import { notFound } from "next/navigation";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import {
  getOrderBySecureToken,
  getPublicOrderTimeline,
} from "@/lib/checkout/order-store";
import { orderSupportUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

interface SecureOrderPageProps {
  params: Promise<{ secureToken: string }>;
}

export default async function SecureOrderPage({ params }: SecureOrderPageProps) {
  const { secureToken } = await params;
  const order = await getOrderBySecureToken(secureToken);
  if (!order) notFound();

  const timeline = getPublicOrderTimeline(order);
  const supportUrl = orderSupportUrl({
    orderNumber: order.orderNumber,
    publicStatus: order.status,
  });

  return (
    <StorefrontPageShell
      title={`Order ${order.orderNumber}`}
      description="Public order timeline. Sensitive payment proofs are not shown here."
    >
      <dl className="mb-8 grid max-w-lg gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Status</dt>
          <dd className="text-text">{order.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Payment</dt>
          <dd className="text-text">{order.paymentStatus}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Total</dt>
          <dd className="text-text">{formatNpr(order.totalNprMinor)}</dd>
        </div>
      </dl>

      <ol className="max-w-lg space-y-4 border-l-2 border-primary/30 pl-4">
        {timeline.map((event) => (
          <li key={`${event.at}-${event.status}`}>
            <p className="font-medium text-text">{event.status}</p>
            <p className="text-sm text-text-muted">{event.message}</p>
          </li>
        ))}
      </ol>

      <Button href={supportUrl} external variant="whatsapp" className="mt-8">
        WhatsApp order support
      </Button>
    </StorefrontPageShell>
  );
}
