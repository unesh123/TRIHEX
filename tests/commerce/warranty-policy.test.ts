import { describe, it, expect } from "vitest";
import { warrantyPolicy } from "@/lib/commerce/warranty-policy";

describe("Commerce Warranty Policy Engine", () => {
  it("correctly models NONE policy", () => {
    const p = warrantyPolicy("NONE");
    expect(p.code).toBe("NONE");
    expect(p.label).toBe("No warranty");
    expect(p.days).toBe(0);
  });

  it("correctly models LIMITED warranty with exact days", () => {
    const p = warrantyPolicy("LIMITED", 20);
    expect(p.code).toBe("LIMITED");
    expect(p.label).toBe("20-day replacement");
    expect(p.days).toBe(20);
  });

  it("correctly models FULL_TERM warranty with exact days", () => {
    const p = warrantyPolicy("FULL_TERM", 365);
    expect(p.code).toBe("FULL_TERM");
    expect(p.label).toBe("Full-term support");
    expect(p.days).toBe(365);
  });

  it("correctly models SERVICE and DIGITAL_DELIVERY policies", () => {
    const serv = warrantyPolicy("SERVICE");
    expect(serv.code).toBe("SERVICE");
    expect(serv.label).toBe("Service support");

    const dig = warrantyPolicy("DIGITAL_DELIVERY");
    expect(dig.code).toBe("DIGITAL_DELIVERY");
    expect(dig.label).toBe("Digital delivery policy");
  });
});

