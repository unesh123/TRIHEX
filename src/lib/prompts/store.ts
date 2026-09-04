import { Prompt, PromptCategory, PromptType } from "./types";
import { TRIHEX_ORIGINAL_PROMPTS } from "./trihex-original-prompts";
import { SEED_PROMPTS_CHAT_PROMPTS } from "./prompts-chat-adapter";

let promptStore: Prompt[] = [
  ...TRIHEX_ORIGINAL_PROMPTS,
  ...SEED_PROMPTS_CHAT_PROMPTS,
];

export function getAllPrompts(filter?: {
  category?: PromptCategory | "ALL";
  type?: PromptType | "ALL";
  search?: string;
  onlyOriginal?: boolean;
}): Prompt[] {
  return promptStore.filter((p) => {
    if (p.status !== "PUBLISHED") return false;
    if (filter?.onlyOriginal && !p.isOriginalTrihex) return false;
    if (filter?.category && filter.category !== "ALL" && p.category !== filter.category) return false;
    if (filter?.type && filter.type !== "ALL" && p.type !== filter.type) return false;
    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });
}

export function getPromptBySlug(slug: string): Prompt | undefined {
  return promptStore.find((p) => p.slug === slug);
}

export function getPromptById(id: string): Prompt | undefined {
  return promptStore.find((p) => p.id === id);
}

export function upvotePrompt(id: string): number {
  const prompt = promptStore.find((p) => p.id === id);
  if (prompt) {
    prompt.votes += 1;
    return prompt.votes;
  }
  return 0;
}

export function addPrompt(prompt: Prompt): Prompt {
  promptStore.unshift(prompt);
  return prompt;
}
