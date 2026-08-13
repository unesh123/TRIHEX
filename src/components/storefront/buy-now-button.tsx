"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readCart, writeCart } from "@/components/storefront/cart-view";
import type { WarrantyTier } from "@/lib/catalog/warranty";

interface BuyNowButtonProps {
  productSlug: string;
  variantSku: string;
  warranty?: WarrantyTier;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function BuyNowButton({
  productSlug,
  variantSku,
  warranty = "none",
  disabled,
  className,
  label = "Buy Now",
}: BuyNowButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function handleBuy() {
    setBusy(true);
    const items = readCart().filter(
      (i) =>
        !(i.productSlug === productSlug && (i.warranty ?? "none") === warranty),
    );
    writeCart([
      ...items,
      { productSlug, variantSku, quantity: 1, warranty },
    ]);
    router.push("/checkout");
  }

  return (
    <Button
      type="button"
      onClick={handleBuy}
      disabled={disabled || busy}
      className={className ?? "w-full"}
    >
      {busy ? "Opening checkout…" : label}
    </Button>
  );
}
