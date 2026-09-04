import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllPrompts,
  getPromptById,
  getPromptBySlug,
  addPrompt,
  upvotePrompt,
  updatePromptContent,
  getPromptVersions,
  resetPromptsStoreForTest,
} from "@/lib/prompts/store";
import {
  parsePromptsCsv,
  normalizePromptsChatItem,
} from "@/lib/prompts/prompts-chat-adapter";
import { Prompt } from "@/lib/prompts/types";

describe("Prompts Persistence & Versioning Engine", () => {
  beforeEach(() => {
    resetPromptsStoreForTest();
  });

  it("seeds initial prompts with version 1 history", () => {
    const prompts = getAllPrompts();
    expect(prompts.length).toBeGreaterThanOrEqual(5);

    const first = prompts[0];
    expect(first.id).toBeDefined();
    expect(first.contentHash).toBeDefined();

    const versions = getPromptVersions(first.id);
    expect(versions.length).toBeGreaterThanOrEqual(1);
    expect(versions[0].version).toBe(1);
    expect(versions[0].content).toBe(first.content);
  });

  it("fetches prompt by slug and ID", () => {
    const prompt = getPromptBySlug("linux-terminal-simulator");
    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe("Linux Terminal Simulator");

    if (prompt) {
      const byId = getPromptById(prompt.id);
      expect(byId?.slug).toBe(prompt.slug);
    }
  });

  it("increments vote count on upvote", () => {
    const prompt = getPromptBySlug("linux-terminal-simulator");
    expect(prompt).toBeDefined();
    const initialVotes = prompt!.votes;

    const newVotes = upvotePrompt(prompt!.id);
    expect(newVotes).toBe(initialVotes + 1);
    expect(getPromptById(prompt!.id)?.votes).toBe(initialVotes + 1);
  });

  it("creates an immutable historical version on content update", async () => {
    const prompt = getPromptBySlug("linux-terminal-simulator");
    expect(prompt).toBeDefined();
    const initialVersions = getPromptVersions(prompt!.id);
    expect(initialVersions.length).toBe(1);

    const updatedText = `You are a specialized Debian 12 terminal emulator. Your first command is: \${newCommand}`;
    const result = await updatePromptContent(prompt!.id, updatedText, "admin-test");

    expect(result).not.toBeNull();
    expect(result?.prompt.content).toBe(updatedText);
    expect(result?.newVersion.version).toBe(2);
    expect(result?.newVersion.content).toBe(updatedText);

    // Verify version history has both versions in descending order
    const history = getPromptVersions(prompt!.id);
    expect(history.length).toBe(2);
    expect(history[0].version).toBe(2);
    expect(history[1].version).toBe(1);

    // Verify variables re-extracted
    expect(result?.prompt.variables.some((v) => v.name === "newCommand")).toBe(true);
  });

  it("adds new prompt and initializes version 1", () => {
    const newPrompt: Prompt = {
      id: "prompt-custom-test",
      slug: "custom-test-prompt",
      title: "Custom Test Prompt",
      description: "A test prompt for unit testing",
      content: "Hello [USER], here is your test prompt.",
      type: "TEXT",
      category: "PRODUCTIVITY",
      tags: ["test", "unit"],
      author: "Tester",
      license: "MIT",
      votes: 10,
      variables: [{ name: "USER", label: "User", defaultValue: "", required: true }],
      isOriginalTrihex: false,
      modelCompatibility: ["Claude 3.7"],
      status: "PUBLISHED",
      contentHash: "custom-hash-v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPrompt(newPrompt);

    const retrieved = getPromptById("prompt-custom-test");
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe("Custom Test Prompt");

    const versions = getPromptVersions("prompt-custom-test");
    expect(versions.length).toBe(1);
    expect(versions[0].version).toBe(1);
  });
});

describe("Prompts.chat CC0 Adapter & CSV Parsing", () => {
  it("parses multiline CSV records with embedded commas and quotes correctly", () => {
    const rawCsv = `act,prompt
"Linux Terminal","I want you to act as a Linux terminal. Run: \${cmd}, please."
"SEO Specialist","You are an SEO expert. Analyze: ""keyword"", rank, and density."
`;

    const records = parsePromptsCsv(rawCsv);
    expect(records.length).toBe(2);
    expect(records[0].act).toBe("Linux Terminal");
    expect(records[0].prompt).toBe("I want you to act as a Linux terminal. Run: ${cmd}, please.");
    expect(records[1].act).toBe("SEO Specialist");
    expect(records[1].prompt).toContain('Analyze: "keyword", rank, and density.');
  });

  it("normalizes prompts.chat items with CC0 license and author attribution", () => {
    const rawItem = {
      act: "Cybersecurity Auditor",
      prompt: "I want you to act as a Cybersecurity Auditor. Check ${targetSystem} for open vulnerabilities.",
      contributor: "f/contributor",
    };

    const normalized = normalizePromptsChatItem(rawItem);
    expect(normalized.license).toBe("CC0-1.0");
    expect(normalized.author).toBe("f/contributor");
    expect(normalized.slug).toBe("cybersecurity-auditor");
    expect(normalized.category).toBe("CODING");
    expect(normalized.sourceUrl).toBe("https://prompts.chat/#cybersecurity-auditor");
    expect(normalized.variables.length).toBe(1);
    expect(normalized.variables[0].name).toBe("targetSystem");
  });
});
