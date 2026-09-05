import { describe, it, expect } from "vitest";
import {
  normalizeProductTitle,
  normalizeCategoryLabel,
  normalizeFeatureString,
  normalizePlanLabel,
} from "@/lib/catalog/content-normalization";

describe("Content Normalization Engine", () => {
  describe("normalizeProductTitle", () => {
    it("eradicates empty parentheses after stripping internal codes", () => {
      expect(normalizeProductTitle("Canva Education — Own Account (FW)")).toBe(
        "Canva Education — Own Account"
      );
      expect(normalizeProductTitle("YouTube Premium — Family Invite ()")).toBe(
        "YouTube Premium — Family Invite"
      );
      expect(normalizeProductTitle("Google AI Ultra — 25K Credits (W15D)")).toBe(
        "Google AI Ultra — 25K Credits"
      );
    });

    it("cleans truncated and malformed parentheses like (20", () => {
      expect(normalizeProductTitle("HMA VPN Key — Android / PC (20")).toBe(
        "HMA VPN Key — Android / PC"
      );
      expect(normalizeProductTitle("Product Name (")).toBe("Product Name");
    });

    it("cleans trailing dashes, hyphens, and duplicate spaces", () => {
      expect(normalizeProductTitle("SuperGrok — 12 Months — FW")).toBe(
        "SuperGrok — 12 Months"
      );
      expect(normalizeProductTitle("Gemini CDK — 12 Months  CDK")).toBe(
        "Gemini — 12 Months"
      );
    });

    it("handles already clean titles without disruption", () => {
      expect(normalizeProductTitle("ChatGPT Plus — 1 Month")).toBe(
        "ChatGPT Plus — 1 Month"
      );
    });
  });

  describe("normalizeCategoryLabel", () => {
    it("converts raw category slugs to title-cased labels", () => {
      expect(normalizeCategoryLabel("creator-tools")).toBe("Creator Tools");
      expect(normalizeCategoryLabel("streaming")).toBe(
        "Streaming & Entertainment"
      );
      expect(normalizeCategoryLabel("ai-tools")).toBe("AI Assistants & Tools");
      expect(normalizeCategoryLabel("developer-tools")).toBe("Developer Tools");
      expect(normalizeCategoryLabel("productivity")).toBe(
        "Productivity & Office"
      );
    });

    it("handles unknown slugs by title-casing", () => {
      expect(normalizeCategoryLabel("cloud-computing")).toBe(
        "Cloud Computing"
      );
    });
  });

  describe("normalizeFeatureString", () => {
    it("restores missing leading numbers on credits strings", () => {
      expect(normalizeFeatureString(",000 shared credits")).toBe(
        "25,000 shared credits"
      );
    });

    it("strips internal codes from feature lines", () => {
      expect(
        normalizeFeatureString("1-Year access with full support (FW)")
      ).toBe("1-Year access with full support");
    });
  });

  describe("normalizePlanLabel", () => {
    it("cleans and capitalizes duration labels", () => {
      expect(normalizePlanLabel("1 month")).toBe("1 Month");
      expect(normalizePlanLabel("12 months")).toBe("12 Months");
      expect(normalizePlanLabel("1 year")).toBe("1 Year");
    });
  });
});
