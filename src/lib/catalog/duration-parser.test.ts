import { describe, expect, it } from "vitest";
import { extractDuration } from "./duration-parser";

describe("extractDuration", () => {
  it("extracts days correctly", () => {
    expect(extractDuration("CapCut Pro — 7 Days")).toEqual({
      value: 7,
      unit: "DAY",
      label: "7 Days",
      approxDays: 7,
    });
    expect(extractDuration("capcut-pro-7-days")).toEqual({
      value: 7,
      unit: "DAY",
      label: "7 Days",
      approxDays: 7,
    });
    // 30 days normalizes to 1 Month
    expect(extractDuration("capcut-pro-30-days")).toEqual({
      value: 1,
      unit: "MONTH",
      label: "1 Month",
      approxDays: 30,
    });
  });

  it("extracts months correctly", () => {
    expect(extractDuration("ChatGPT Plus — 1 Month")).toEqual({
      value: 1,
      unit: "MONTH",
      label: "1 Month",
      approxDays: 30,
    });
    expect(extractDuration("ChatGPT Plus — 3 Months")).toEqual({
      value: 3,
      unit: "MONTH",
      label: "3 Months",
      approxDays: 90,
    });
    expect(extractDuration("ChatGPT Plus — 6 Months")).toEqual({
      value: 6,
      unit: "MONTH",
      label: "6 Months",
      approxDays: 180,
    });
    expect(extractDuration("ChatGPT Plus — 12 Months")).toEqual({
      value: 12,
      unit: "MONTH",
      label: "12 Months (1 Year)",
      approxDays: 360,
    });
    expect(extractDuration("Gemini AI Pro 5TB — 18 Months")).toEqual({
      value: 18,
      unit: "MONTH",
      label: "18 Months",
      approxDays: 540,
    });
    expect(extractDuration("NordVPN — 24 Months")).toEqual({
      value: 24,
      unit: "MONTH",
      label: "24 Months (2 Years)",
      approxDays: 720,
    });
  });

  it("extracts years correctly", () => {
    expect(extractDuration("Canva Pro — 1 Year")).toEqual({
      value: 1,
      unit: "YEAR",
      label: "1 Year",
      approxDays: 365,
    });
    expect(extractDuration("Figma Edu — 2 Years")).toEqual({
      value: 2,
      unit: "YEAR",
      label: "2 Years",
      approxDays: 730,
    });
  });

  it("handles slug-based durations", () => {
    expect(extractDuration("cursor-pro-12m")).toEqual({
      value: 12,
      unit: "MONTH",
      label: "12 Months (1 Year)",
      approxDays: 360,
    });
    expect(extractDuration("replit-core-1-month")).toEqual({
      value: 1,
      unit: "MONTH",
      label: "1 Month",
      approxDays: 30,
    });
  });
});
