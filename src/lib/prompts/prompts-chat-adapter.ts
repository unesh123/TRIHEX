import { safeFetch } from "@/lib/ingestion/safe-fetch";
import { sanitizeInertText } from "@/lib/ingestion/inert-parser";
import { Prompt, extractPromptVariables } from "./types";
import { createHash } from "node:crypto";

export interface PromptsChatRawPrompt {
  act: string;
  prompt: string;
  contributor?: string;
}

export const SEED_PROMPTS_CHAT_PROMPTS: Prompt[] = [
  {
    id: "pc-linux-terminal",
    slug: "linux-terminal-simulator",
    title: "Linux Terminal Simulator",
    description: "Acts as an interactive Linux terminal. Emulates bash commands, directory traversal, shell pipelines, and stderr outputs inside code blocks.",
    category: "CODING",
    type: "CODE",
    author: "f/prompts.chat",
    sourceUrl: "https://prompts.chat/#linux-terminal",
    license: "CC0-1.0",
    votes: 890,
    isOriginalTrihex: false,
    modelCompatibility: ["Claude 3.7", "GPT-4o", "DeepSeek-R1"],
    tags: ["linux", "bash", "cli", "terminal", "system-admin"],
    status: "PUBLISHED",
    difficulty: "INTERMEDIATE",
    qualityStatus: "CURATED",
    contentHash: "pc-linux-terminal-v1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first command is: \${firstCommand}`,
    variables: [],
  },
  {
    id: "pc-english-translator",
    slug: "english-translator-and-improver",
    title: "English Translator and Vocabulary Enhancer",
    description: "Translates and improves spoken and written sentences into idiomatic, high-level English with precise terminology.",
    category: "WRITING",
    type: "TEXT",
    author: "f/prompts.chat",
    sourceUrl: "https://prompts.chat/#english-translator",
    license: "CC0-1.0",
    votes: 750,
    isOriginalTrihex: false,
    modelCompatibility: ["Claude 3.7", "GPT-4o"],
    tags: ["translation", "grammar", "vocabulary", "english", "writing"],
    status: "PUBLISHED",
    difficulty: "BEGINNER",
    qualityStatus: "CURATED",
    contentHash: "pc-eng-trans-v1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations. My first sentence is: "\${inputSentence}"`,
    variables: [],
  },
  {
    id: "pc-prompt-generator",
    slug: "meta-prompt-engineer-generator",
    title: "Meta-Prompt Engineer & Instruction Optimizer",
    description: "Refines rough, vague user ideas into structured, high-performing system prompts with few-shot examples and boundary constraints.",
    category: "PRODUCTIVITY",
    type: "SYSTEM",
    author: "f/prompts.chat",
    sourceUrl: "https://prompts.chat/#midjourney-prompt-generator",
    license: "CC0-1.0",
    votes: 910,
    isOriginalTrihex: false,
    modelCompatibility: ["Claude 3.7 Sonnet", "GPT-4o"],
    tags: ["prompt-engineering", "meta-prompt", "optimizer", "system-design"],
    status: "PUBLISHED",
    difficulty: "ADVANCED",
    qualityStatus: "CURATED",
    contentHash: "pc-meta-prompt-v1",
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-09-04T00:00:00Z",
    content: `I want you to act as a Prompt Generator. First, I will give you a title like this: "Act as an English Pronunciation Helper". Then you will generate a full structured prompt based on my requested task: "\${desiredTask}". The prompt must include Persona, Context, Concrete Instructions, Edge Cases to Avoid, and Output Formatting Rules. Output only the finished prompt and nothing else.`,
    variables: [],
  },
];

for (const p of SEED_PROMPTS_CHAT_PROMPTS) {
  p.variables = extractPromptVariables(p.content);
}

/**
 * Standard-compliant CSV parser for "act,prompt" rows supporting quotes and multiline cells.
 */
export function parsePromptsCsv(csvText: string): PromptsChatRawPrompt[] {
  const records: PromptsChatRawPrompt[] = [];
  let i = 0;
  const n = csvText.length;

  function parseField(): string {
    if (i >= n) return "";
    if (csvText[i] === '"') {
      i++; // skip opening quote
      let field = "";
      while (i < n) {
        if (csvText[i] === '"') {
          if (i + 1 < n && csvText[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          field += csvText[i];
          i++;
        }
      }
      return field;
    } else {
      let field = "";
      while (i < n && csvText[i] !== ',' && csvText[i] !== '\n' && csvText[i] !== '\r') {
        field += csvText[i];
        i++;
      }
      return field;
    }
  }

  let isHeader = true;
  while (i < n) {
    while (i < n && (csvText[i] === '\r' || csvText[i] === '\n')) {
      i++;
    }
    if (i >= n) break;

    const act = parseField();
    if (i < n && csvText[i] === ',') {
      i++;
    }
    const prompt = parseField();

    while (i < n && csvText[i] !== '\n') {
      i++;
    }
    if (i < n && csvText[i] === '\n') {
      i++;
    }

    if (isHeader) {
      isHeader = false;
      if (act.toLowerCase() === "act" || prompt.toLowerCase() === "prompt") {
        continue;
      }
    }

    if (act.trim() && prompt.trim()) {
      records.push({ act: act.trim(), prompt: prompt.trim() });
    }
  }

  return records;
}

export function normalizePromptsChatItem(item: PromptsChatRawPrompt): Prompt {
  const title = sanitizeInertText(item.act, 100);
  const rawContent = sanitizeInertText(item.prompt, 10000);
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const variables = extractPromptVariables(rawContent);
  const hash = createHash("sha256").update(rawContent).digest("hex").slice(0, 16);
  const now = new Date().toISOString();

  // Infer category from title/content
  let category: Prompt["category"] = "PRODUCTIVITY";
  const lower = (title + " " + rawContent).toLowerCase();
  if (lower.includes("code") || lower.includes("developer") || lower.includes("python") || lower.includes("javascript") || lower.includes("terminal") || lower.includes("security") || lower.includes("cyber") || lower.includes("vulnerabilit") || lower.includes("audit")) {
    category = "CODING";
  } else if (lower.includes("write") || lower.includes("story") || lower.includes("novel") || lower.includes("translator") || lower.includes("poem")) {
    category = "WRITING";
  } else if (lower.includes("image") || lower.includes("midjourney") || lower.includes("photo") || lower.includes("video")) {
    category = "IMAGE_VIDEO";
  } else if (lower.includes("market") || lower.includes("seo") || lower.includes("sales") || lower.includes("advertis")) {
    category = "MARKETING_SALES";
  } else if (lower.includes("study") || lower.includes("research") || lower.includes("academic") || lower.includes("tutor")) {
    category = "STUDY_RESEARCH";
  }

  return {
    id: `pc-${slug}`,
    slug,
    title,
    description: `Community prompt from prompts.chat CC0 archive for: ${title}.`,
    content: rawContent,
    type: category === "CODING" ? "CODE" : "TEXT",
    category,
    tags: ["community", "prompts-chat", "cc0", category.toLowerCase()],
    author: item.contributor ? sanitizeInertText(item.contributor, 50) : "f/prompts.chat",
    sourceUrl: `https://prompts.chat/#${slug}`,
    license: "CC0-1.0",
    votes: 50,
    variables,
    isOriginalTrihex: false,
    modelCompatibility: ["Claude 3.7", "GPT-4o"],
    status: "PUBLISHED",
    difficulty: "INTERMEDIATE",
    qualityStatus: "COMMUNITY",
    contentHash: hash,
    syncedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Synchronizes prompts from the public CC0 prompts.chat archive using SafeFetch 2.0.
 * Preserves author attribution and CC0-1.0 license dedication.
 */
export async function syncPromptsChatArchive(options?: {
  customUrl?: string;
  maxItems?: number;
}): Promise<{ fetched: number; created: number; updated: number; skipped: number }> {
  const url =
    options?.customUrl ||
    "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv";
  const maxItems = options?.maxItems || 100;

  try {
    const res = await safeFetch(url, {
      timeoutMs: 10000,
      maxSizeBytes: 2 * 1024 * 1024, // 2MB stream limit
      allowedDomains: ["raw.githubusercontent.com", "prompts.chat", "github.com"],
    });

    if (!res.ok || !res.data) {
      console.warn(`[prompts-chat-adapter] Remote archive returned status ${res.status}`);
      return { fetched: 0, created: 0, updated: 0, skipped: 0 };
    }

    const csvData = typeof res.data === "string" ? res.data : (res.rawText || "");
    const rows = parsePromptsCsv(csvData);
    const targetRows = rows.slice(0, maxItems);

    // Dynamically import store functions to avoid circular module initialization
    const { addPrompt, getPromptById, getPromptBySlug, updatePromptContent } = await import("./store");

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of targetRows) {
      const normalized = normalizePromptsChatItem(row);
      const existing = getPromptById(normalized.id) || getPromptBySlug(normalized.slug);

      if (!existing) {
        addPrompt(normalized);
        created++;
      } else if (existing.content !== normalized.content) {
        await updatePromptContent(existing.id, normalized.content, "prompts.chat-sync");
        updated++;
      } else {
        skipped++;
      }
    }

    return {
      fetched: targetRows.length,
      created,
      updated,
      skipped,
    };
  } catch (err) {
    console.error("[prompts-chat-adapter] Sync error:", err);
    return { fetched: 0, created: 0, updated: 0, skipped: 0 };
  }
}
