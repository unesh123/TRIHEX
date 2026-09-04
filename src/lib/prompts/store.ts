import {
  Prompt,
  PromptCategory,
  PromptType,
  PromptVersion,
  PromptDifficulty,
  PromptQualityStatus,
  PromptVariable,
  extractPromptVariables,
} from "./types";
import { TRIHEX_ORIGINAL_PROMPTS } from "./trihex-original-prompts";
import { SEED_PROMPTS_CHAT_PROMPTS } from "./prompts-chat-adapter";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { createHash } from "node:crypto";

export const INITIAL_PROMPTS: Prompt[] = [
  ...TRIHEX_ORIGINAL_PROMPTS,
  ...SEED_PROMPTS_CHAT_PROMPTS,
];

// In-memory mirror for low-latency synchronous reads
let promptStore: Prompt[] = [...INITIAL_PROMPTS];
let promptVersionsStore: Record<string, PromptVersion[]> = {};

// Initialize version 1 for initial prompts
for (const p of promptStore) {
  if (!promptVersionsStore[p.id]) {
    promptVersionsStore[p.id] = [
      {
        id: `pv-${p.id}-1`,
        promptId: p.id,
        version: 1,
        content: p.content,
        contentHash:
          p.contentHash ||
          createHash("sha256").update(p.content).digest("hex").slice(0, 16),
        capturedAt: p.createdAt || new Date().toISOString(),
      },
    ];
  }
}

let dbSyncInitialized = false;

function mapVariablesForDb(vars: PromptVariable[]) {
  return vars.map((v) => ({
    name: v.name,
    label: v.label || v.name,
    placeholder: v.placeholder || v.label || `Enter ${v.name}...`,
    defaultValue: v.defaultValue || "",
    required: v.required ?? true,
  }));
}

function mapDbRowToPrompt(row: typeof schema.prompts.$inferSelect): Prompt {
  return {
    id: row.id,
    sourceId: row.sourceId || undefined,
    externalId: row.externalId || undefined,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    type: row.type as PromptType,
    category: row.category as PromptCategory,
    tags: row.tags || [],
    author: row.author,
    sourceUrl: row.sourceUrl || undefined,
    license: row.license,
    votes: row.votes,
    variables: (row.variables as any) || [],
    isOriginalTrihex: row.isOriginalTrihex,
    modelCompatibility: (row.modelCompatibility as string[]) || [],
    status: row.status as any,
    difficulty: (row.difficulty as PromptDifficulty) || "INTERMEDIATE",
    qualityStatus: (row.qualityStatus as PromptQualityStatus) || "CURATED",
    contentHash: row.contentHash,
    syncedAt: row.syncedAt ? row.syncedAt.toISOString() : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Ensures PostgreSQL tables have initial prompts seeded and syncs the in-memory cache
 */
export async function syncPromptsFromDatabase(): Promise<Prompt[]> {
  const db = getDb();
  if (!db) {
    dbSyncInitialized = true;
    return promptStore;
  }

  try {
    const existing = await db.select().from(schema.prompts);

    // If database has no prompts yet, seed initial prompts
    if (existing.length === 0) {
      for (const p of INITIAL_PROMPTS) {
        try {
          const hash =
            p.contentHash ||
            createHash("sha256").update(p.content).digest("hex").slice(0, 16);

          await db.insert(schema.prompts).values({
            id: p.id,
            slug: p.slug,
            title: p.title,
            description: p.description,
            content: p.content,
            type: p.type,
            category: p.category,
            tags: p.tags,
            author: p.author,
            sourceUrl: p.sourceUrl,
            license: p.license,
            votes: p.votes,
            variables: mapVariablesForDb(p.variables),
            isOriginalTrihex: p.isOriginalTrihex,
            modelCompatibility: p.modelCompatibility,
            status: p.status,
            difficulty: p.difficulty || "INTERMEDIATE",
            qualityStatus:
              p.qualityStatus ||
              (p.isOriginalTrihex ? "TRIHEX_VERIFIED" : "CURATED"),
            contentHash: hash,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          });

          // Insert initial version 1
          await db.insert(schema.promptVersions).values({
            promptId: p.id,
            version: 1,
            content: p.content,
            contentHash: hash,
            capturedAt: new Date(p.createdAt),
          });
        } catch (insertErr) {
          console.error(`[prompts] Seed insert error for ${p.id}:`, insertErr);
        }
      }

      dbSyncInitialized = true;
      return promptStore;
    }

    // Map database rows to memory
    const loadedPrompts = existing.map(mapDbRowToPrompt);
    promptStore = loadedPrompts;

    // Load versions
    const allVersions = await db
      .select()
      .from(schema.promptVersions)
      .orderBy(desc(schema.promptVersions.version));

    promptVersionsStore = {};
    for (const v of allVersions) {
      if (!promptVersionsStore[v.promptId]) {
        promptVersionsStore[v.promptId] = [];
      }
      promptVersionsStore[v.promptId].push({
        id: v.id,
        promptId: v.promptId,
        version: v.version,
        content: v.content,
        contentHash: v.contentHash,
        capturedAt: v.capturedAt.toISOString(),
      });
    }

    dbSyncInitialized = true;
    return promptStore;
  } catch (error) {
    console.error("[prompts] Database sync error, retaining in-memory state:", error);
    dbSyncInitialized = true;
    return promptStore;
  }
}

// Auto-trigger sync once in server environment
if (typeof window === "undefined" && !dbSyncInitialized) {
  syncPromptsFromDatabase().catch((err) => {
    console.error("[prompts] Background initial sync failed:", err);
  });
}

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

    const db = getDb();
    if (db) {
      (async () => {
        try {
          await db
            .update(schema.prompts)
            .set({ votes: sql`${schema.prompts.votes} + 1` })
            .where(eq(schema.prompts.id, id));
        } catch (e) {
          console.error("[prompts] Failed to persist upvote to DB:", e);
        }
      })();
    }

    return prompt.votes;
  }
  return 0;
}

export function addPrompt(prompt: Prompt): Prompt {
  const existingIdx = promptStore.findIndex(
    (p) => p.id === prompt.id || p.slug === prompt.slug
  );
  if (existingIdx >= 0) {
    promptStore[existingIdx] = prompt;
  } else {
    promptStore.unshift(prompt);
  }

  const hash =
    prompt.contentHash ||
    createHash("sha256").update(prompt.content).digest("hex").slice(0, 16);

  if (!promptVersionsStore[prompt.id]) {
    promptVersionsStore[prompt.id] = [
      {
        id: `pv-${prompt.id}-1`,
        promptId: prompt.id,
        version: 1,
        content: prompt.content,
        contentHash: hash,
        capturedAt: prompt.createdAt || new Date().toISOString(),
      },
    ];
  }

  const db = getDb();
  if (db) {
    (async () => {
      try {
        await db
          .insert(schema.prompts)
          .values({
            id: prompt.id,
            sourceId: prompt.sourceId,
            externalId: prompt.externalId,
            slug: prompt.slug,
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            type: prompt.type,
            category: prompt.category,
            tags: prompt.tags,
            author: prompt.author,
            sourceUrl: prompt.sourceUrl,
            license: prompt.license,
            votes: prompt.votes,
            variables: mapVariablesForDb(prompt.variables),
            isOriginalTrihex: prompt.isOriginalTrihex,
            modelCompatibility: prompt.modelCompatibility,
            status: prompt.status,
            difficulty: prompt.difficulty || "INTERMEDIATE",
            qualityStatus:
              prompt.qualityStatus ||
              (prompt.isOriginalTrihex ? "TRIHEX_VERIFIED" : "COMMUNITY"),
            contentHash: hash,
            createdAt: new Date(prompt.createdAt),
            updatedAt: new Date(prompt.updatedAt),
          })
          .onConflictDoUpdate({
            target: schema.prompts.id,
            set: {
              title: prompt.title,
              description: prompt.description,
              content: prompt.content,
              contentHash: hash,
              variables: mapVariablesForDb(prompt.variables),
              updatedAt: new Date(prompt.updatedAt),
            },
          });
      } catch (e) {
        console.error("[prompts] Failed to persist prompt to DB:", e);
      }
    })();
  }

  return prompt;
}

export async function updatePromptContent(
  promptId: string,
  newContent: string,
  editor: string = "system"
): Promise<{ prompt: Prompt; newVersion: PromptVersion } | null> {
  const prompt = promptStore.find((p) => p.id === promptId);
  if (!prompt) return null;

  const newHash = createHash("sha256").update(newContent).digest("hex").slice(0, 16);
  if (prompt.content === newContent && prompt.contentHash === newHash) {
    const existingVersions = promptVersionsStore[promptId] || [];
    return { prompt, newVersion: existingVersions[0] };
  }

  const existingVersions = promptVersionsStore[promptId] || [];
  const currentMaxVersion = existingVersions.reduce(
    (max, v) => Math.max(max, v.version),
    0
  );
  const nextVersionNum = currentMaxVersion + 1;
  const now = new Date().toISOString();

  const newVersion: PromptVersion = {
    id: `pv-${promptId}-${nextVersionNum}`,
    promptId,
    version: nextVersionNum,
    content: newContent,
    contentHash: newHash,
    capturedAt: now,
  };

  if (!promptVersionsStore[promptId]) {
    promptVersionsStore[promptId] = [];
  }
  promptVersionsStore[promptId].unshift(newVersion);

  prompt.content = newContent;
  prompt.contentHash = newHash;
  prompt.variables = extractPromptVariables(newContent);
  prompt.updatedAt = now;

  const db = getDb();
  if (db) {
    try {
      await db
        .update(schema.prompts)
        .set({
          content: newContent,
          contentHash: newHash,
          variables: mapVariablesForDb(prompt.variables),
          updatedAt: new Date(now),
        })
        .where(eq(schema.prompts.id, promptId));

      await db.insert(schema.promptVersions).values({
        promptId,
        version: nextVersionNum,
        content: newContent,
        contentHash: newHash,
        capturedAt: new Date(now),
      });
    } catch (e) {
      console.error("[prompts] Failed to persist prompt version update to DB:", e);
    }
  }

  return { prompt, newVersion };
}

export function getPromptVersions(promptId: string): PromptVersion[] {
  return promptVersionsStore[promptId] || [];
}

/** Reset store — tests only */
export function resetPromptsStoreForTest(items?: Prompt[]): void {
  promptStore = items ? [...items] : [...INITIAL_PROMPTS];
  promptVersionsStore = {};
  for (const p of promptStore) {
    promptVersionsStore[p.id] = [
      {
        id: `pv-${p.id}-1`,
        promptId: p.id,
        version: 1,
        content: p.content,
        contentHash:
          p.contentHash ||
          createHash("sha256").update(p.content).digest("hex").slice(0, 16),
        capturedAt: p.createdAt || new Date().toISOString(),
      },
    ];
  }
}
