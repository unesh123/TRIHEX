import { describe, it, expect } from "vitest";
import { extractPromptVariables, interpolatePrompt } from "@/lib/prompts/types";
import { TRIHEX_ORIGINAL_PROMPTS } from "@/lib/prompts/trihex-original-prompts";

describe("Prompt Variables & Interpolation Engine", () => {
  it("extracts multiple variable syntax variations", () => {
    const template = `Generate a \${framework} API for \${entityName} with {{validationRules}} and [MAX_RECORDS].`;
    const vars = extractPromptVariables(template);

    expect(vars.map((v) => v.name)).toEqual(
      expect.arrayContaining(["framework", "entityName", "validationRules", "MAX_RECORDS"])
    );
  });

  it("interpolates variables cleanly without mutating template", () => {
    const template = "Hello \${name}, build a {{language}} app with [DATABASE].";
    const result = interpolatePrompt(template, {
      name: "Prasid",
      language: "TypeScript",
      database: "PostgreSQL",
    });

    expect(result).toBe("Hello Prasid, build a TypeScript app with PostgreSQL.");
  });

  it("preserves unfilled variables gracefully", () => {
    const template = "Hello \${name}, your role is \${role}.";
    const result = interpolatePrompt(template, {
      name: "Suman",
    });

    expect(result).toBe("Hello Suman, your role is \${role}.");
  });

  it("ensures all TRIHEX original prompts have valid variables extracted", () => {
    for (const prompt of TRIHEX_ORIGINAL_PROMPTS) {
      expect(prompt.isOriginalTrihex).toBe(true);
      expect(prompt.modelCompatibility.length).toBeGreaterThan(0);
      expect(prompt.content.length).toBeGreaterThan(100);
      expect(prompt.variables.length).toBeGreaterThan(0);
    }
  });
});
