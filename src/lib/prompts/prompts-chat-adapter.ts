import { safeFetch } from "@/lib/ingestion/safe-fetch";
import { sanitizeInertText } from "@/lib/ingestion/inert-parser";
import { Prompt, extractPromptVariables } from "./types";

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

export function normalizePromptsChatItem(item: PromptsChatRawPrompt): Prompt {
  const title = sanitizeInertText(item.act, 100);
  const rawContent = sanitizeInertText(item.prompt, 10000);
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const variables = extractPromptVariables(rawContent);

  return {
    id: `pc-${slug}`,
    slug,
    title,
    description: `Community prompt from prompts.chat CC0 archive for: ${title}.`,
    content: rawContent,
    type: rawContent.toLowerCase().includes("code") ? "CODE" : "TEXT",
    category: "PRODUCTIVITY",
    tags: ["community", "prompts-chat", "cc0"],
    author: item.contributor ? sanitizeInertText(item.contributor, 50) : "f/prompts.chat",
    sourceUrl: "https://prompts.chat",
    license: "CC0-1.0",
    votes: 100,
    variables,
    isOriginalTrihex: false,
    modelCompatibility: ["Claude 3.7", "GPT-4o"],
    status: "PUBLISHED",
    contentHash: `hash-${slug}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
