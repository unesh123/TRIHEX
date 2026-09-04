/**
 * Agent Skills Library Data Models
 */

export interface SkillFile {
  path: string; // e.g. "SKILL.md", "scripts/migrate.sh", "references/owasp.md"
  filename: string;
  language: string;
  content: string;
  sizeBytes: number;
}

export type SkillCategory =
  | "CODING"
  | "SECURITY"
  | "RESEARCH"
  | "AUTOMATION"
  | "DATA";

export interface AgentSkill {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: SkillCategory;
  tags: string[];
  author: string;
  license: string;
  files: SkillFile[];
  compatibility: string[]; // e.g. ["Antigravity", "Claude Code", "Cursor", "Codex"]
  verifiedSafe: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}
