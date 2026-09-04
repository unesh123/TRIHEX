"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readCart, writeCart } from "@/components/storefront/cart-view";

interface AddToCartButtonProps {
  productSlug: string;
  variantSku: string;
  disabled?: boolean;
}

export function AddToCartButton({
  productSlug,
  variantSku,
  disabled,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const items = readCart();
    const existing = items.find(
      (i) => i.productSlug === productSlug && i.variantSku === variantSku,
    );
    const next = existing
      ? items.map((i) =>
          i.productSlug === productSlug && i.variantSku === variantSku
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      : [...items, { productSlug, variantSku, quantity: 1 }];
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

