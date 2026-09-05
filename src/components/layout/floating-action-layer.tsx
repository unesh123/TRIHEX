import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating";
import { TrihexCopilot } from "@/components/copilot/trihex-copilot";
import { RecentPurchaseToast } from "@/components/storefront/recent-purchase-toast";

/**
 * Coordinated Floating Action Layer for TRIHEX DIGITAL:
 * - Bottom-Right: Contextual WhatsApp Direct Support (z-30)
 * - Bottom-Left: TRIHEX Copilot AI Assistant (z-30)
 * - Above Bottom-Left: Non-intrusive Verified Social Proof Toast (z-40)
 */
export function FloatingActionLayer() {
  return (
    <>
      <WhatsAppFloatingButton />
      <TrihexCopilot />
      <RecentPurchaseToast />
    </>
  );
}
