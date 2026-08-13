"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readCart, writeCart } from "@/components/storefront/cart-view";
import type { WarrantyTier } from "@/lib/catalog/warranty";

interface AddToCartButtonProps {
  productSlug: string;
  variantSku: string;
  warranty?: WarrantyTier;
  disabled?: boolean;
}

export function AddToCartButton({
  productSlug,
  variantSku,
  warranty = "none",
  disabled,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const items = readCart();
    const existing = items.find(
      (i) =>
        i.productSlug === productSlug && (i.warranty ?? "none") === warranty,
    );
    const next = existing
      ? items.map((i) =>
          i.productSlug === productSlug && (i.warranty ?? "none") === warranty
            ? { ...i, quantity: i.quantity + 1, warranty }
            : i,
        )
      : [...items, { productSlug, variantSku, quantity: 1, warranty }];
    writeCart(next);
    setAdded(true);
  }

  if (added) {
    return (
      <Button href="/cart" className="w-full">
        Added — view cart
      </Button>
    );
  }

  return (
    <Button type="button" onClick={handleAdd} disabled={disabled} className="w-full">
      Add to cart
    </Button>
  );
}
