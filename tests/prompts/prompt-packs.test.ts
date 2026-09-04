import { describe, it, expect } from "vitest";
import { getAllPrompts, getPromptVersions } from "@/lib/prompts/store";
import { interpolatePrompt, extractPromptVariables } from "@/lib/prompts/types";

describe("Prompt Library 3.0 & Curated Packs", () => {
  it("verifies all initial prompts have version 1 recorded", () => {
    const prompts = getAllPrompts();
    expect(prompts.length).toBeGreaterThan(0);

    for (const prompt of prompts.slice(0, 5)) {
      const versions = getPromptVersions(prompt.id);
      expect(versions.length).toBeGreaterThanOrEqual(1);
      expect(versions[0].version).toBe(1);
      expect(versions[0].contentHash).toBeDefined();
    }
  });

  it("extracts and customizes variables correctly", () => {
    const content = "Write a Next.js 16 server action in {{language}} handling {{feature}} with ${auth} auth.";
    const vars = extractPromptVariables(content);

    expect(vars.map((v) => v.name)).toEqual(expect.arrayContaining(["language", "feature", "auth"]));

    const interpolated = interpolatePrompt(content, {
      language: "TypeScript",
      feature: "checkout",
      auth: "session",
    });

    expect(interpolated).toBe("Write a Next.js 16 server action in TypeScript handling checkout with session auth.");
  });

  it("verifies prompt categories map into curated pack domains", () => {
    const prompts = getAllPrompts();
    const codingPrompts = prompts.filter((p) => p.category === "CODING");
    const mediaPrompts = prompts.filter((p) => p.category === "IMAGE_VIDEO");

    expect(codingPrompts.length).toBeGreaterThan(0);
    expect(mediaPrompts.length).toBeGreaterThan(0);
  });
});
