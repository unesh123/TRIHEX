/**
 * TRIHEX Prompt Library Types & Enums
 */

export type PromptType = "TEXT" | "IMAGE" | "VIDEO" | "CODE" | "SYSTEM";

export type PromptCategory =
  | "CODING"
  | "IMAGE_VIDEO"
  | "MARKETING_SALES"
  | "STUDY_RESEARCH"
  | "PRODUCTIVITY"
  | "WRITING";

export type PromptDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type PromptQualityStatus =
  | "UNREVIEWED"
  | "COMMUNITY"
  | "CURATED"
  | "TRIHEX_VERIFIED";

export interface PromptVariable {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface Prompt {
  id: string;
  sourceId?: string;
  externalId?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  type: PromptType;
  category: PromptCategory;
  tags: string[];
  author: string;
  sourceUrl?: string;
  license: string; // e.g. "CC0-1.0", "TRIHEX-ORIGINAL"
  votes: number;
  variables: PromptVariable[];
  isOriginalTrihex: boolean;
  modelCompatibility: string[]; // e.g. ["Claude 3.7", "GPT-4o", "DeepSeek-R1", "Cursor", "Midjourney v6"]
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  difficulty?: PromptDifficulty;
  qualityStatus?: PromptQualityStatus;
  contentHash: string;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  contentHash: string;
  capturedAt: string;
}

export function extractPromptVariables(content: string): PromptVariable[] {
  const varsMap = new Map<string, PromptVariable>();

  // Matches ${variable}, {{variable}}, and [VARIABLE_NAME]
  const pattern = /(?:\$\{([a-zA-Z0-9_]+)\})|(?:\{\{([a-zA-Z0-9_]+)\}\})|(?:\[([A-Z0-9_]{3,})\])/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const rawName = match[1] || match[2] || match[3];
    if (rawName && !varsMap.has(rawName)) {
      // Create user-friendly label
      const label = rawName
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

      varsMap.set(rawName, {
        name: rawName,
        label,
        placeholder: `Enter ${label}...`,
        defaultValue: "",
        required: true,
      });
    }
  }

  return Array.from(varsMap.values());
}

export function interpolatePrompt(content: string, values: Record<string, string>): string {
  let result = content;

  for (const [key, val] of Object.entries(values)) {
    if (!val) continue;
    // Replace ${key}
    result = result.split(`\${${key}}`).join(val);
    // Replace {{key}}
    result = result.split(`{{${key}}}`).join(val);
    // Replace [KEY]
    result = result.split(`[${key.toUpperCase()}]`).join(val);
  }

  return result;
}
