import type { AvailabilityStatus, ProductVariantContract } from "./catalogue-contract";

export function assertCheckoutAllowed(v: {
  publishable?: boolean;
  availabilityStatus?: string;
  availability?: string;
  priceVersion?: number;
  sellPriceNpr?: number;
  sellPriceNprMinor?: number;
  sku?: string;
}): void {
  if (v.publishable === false) {
    throw new Error("This plan is not published.");
  }
  const status = v.availabilityStatus || v.availability;
  if (status === "under_review") {
    throw new Error("Confirm availability before payment.");
  }
  if (status === "out_of_stock") {
    throw new Error("This plan is out of stock.");
  }
  if (status !== "available") {
    throw new Error("This plan is unavailable.");
  }
  const price = v.sellPriceNpr ?? (v.sellPriceNprMinor ? v.sellPriceNprMinor / 100 : 0);
  if (price <= 0) {
    throw new Error("This plan does not have a valid active price.");
  }
}

export function canCheckout(v: {
  publishable?: boolean;
  availabilityStatus?: string;
  availability?: string;
  sellPriceNpr?: number;
  sellPriceNprMinor?: number;
}): boolean {
  const status = v.availabilityStatus || v.availability;
  const price = v.sellPriceNpr ?? (v.sellPriceNprMinor ? v.sellPriceNprMinor / 100 : 0);
  return Boolean(
    v.publishable !== false &&
    status === "available" &&
    (price > 0 || (v.sellPriceNpr === undefined && v.sellPriceNprMinor === undefined)),
  );
}

export function availabilityBadgeLabel(status: AvailabilityStatus | string): {
  label: string;
  tone: "available" | "review" | "out_of_stock" | "disabled";
} {
  switch (status) {
    case "available":
      return { label: "Ready to activate", tone: "available" };
    case "under_review":
      return { label: "Availability under review", tone: "review" };
    case "out_of_stock":
      return { label: "Out of stock", tone: "out_of_stock" };
    case "disabled":
    default:
      return { label: "Unavailable", tone: "disabled" };
  }
}
