import { describe, it, expect } from "vitest";
import { isRouteSuppressed } from "@/components/storefront/recent-purchase-toast";

describe("RecentPurchaseToast Route Suppression Matrix", () => {
  it("suppresses recent purchase toasts on map and deep research pages", () => {
    expect(isRouteSuppressed("/map")).toBe(true);
    expect(isRouteSuppressed("/nepal/research")).toBe(true);
    expect(isRouteSuppressed("/research")).toBe(true);
  });

  it("suppresses recent purchase toasts on prompt and skill detail pages", () => {
    expect(isRouteSuppressed("/prompts")).toBe(true);
    expect(isRouteSuppressed("/prompts/csharp-clean-architecture")).toBe(true);
    expect(isRouteSuppressed("/skills")).toBe(true);
    expect(isRouteSuppressed("/skills/security-scanner")).toBe(true);
  });

  it("suppresses recent purchase toasts on admin, checkout, and order tracking pages", () => {
    expect(isRouteSuppressed("/admin")).toBe(true);
    expect(isRouteSuppressed("/admin/login")).toBe(true);
    expect(isRouteSuppressed("/admin/queue")).toBe(true);
    expect(isRouteSuppressed("/checkout")).toBe(true);
    expect(isRouteSuppressed("/checkout/step-2")).toBe(true);
    expect(isRouteSuppressed("/orders/ord-12345")).toBe(true);
    expect(isRouteSuppressed("/track-order")).toBe(true);
  });

  it("allows recent purchase toasts on storefront browsing pages", () => {
    expect(isRouteSuppressed("/")).toBe(false);
    expect(isRouteSuppressed("/products")).toBe(false);
    expect(isRouteSuppressed("/products/cursor-pro-12m")).toBe(false);
    expect(isRouteSuppressed("/vault")).toBe(false);
    expect(isRouteSuppressed("/deals")).toBe(false);
    expect(isRouteSuppressed("/nepal")).toBe(false);
  });
});
