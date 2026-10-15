import { describe, it, expect } from "vitest";
import { getAllSkills, getSkillBySlug, searchSkills } from "@/lib/skills/store";
import { getAllCuratedRepos, searchCuratedRepos } from "@/lib/github/curated-repos";
import { performUniversalSearch } from "@/lib/search/universal-search";

describe("TRIHEX 100+ Enterprise Agent Skills Library", () => {
  it("contains more than 100 verified production-grade modular skills", () => {
    const skills = getAllSkills();
    expect(skills.length).toBeGreaterThanOrEqual(100);
  });

  it("ensures all skills have valid slugs, files, and compatibility runtimes", () => {
    const skills = getAllSkills();
    for (const skill of skills) {
      expect(skill.id).toBeTruthy();
      expect(skill.slug).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.files.length).toBeGreaterThanOrEqual(1);
      expect(skill.compatibility.length).toBeGreaterThanOrEqual(1);
      expect(skill.verifiedSafe).toBe(true);
    }
  });

  it("retrieves skills by slug correctly", () => {
    const supabaseSkill = getSkillBySlug("supabase-fullstack-ops");
    expect(supabaseSkill).toBeDefined();
    expect(supabaseSkill?.name).toContain("Supabase");
  });

  it("searches skills by keyword accurately", () => {
    const results = searchSkills("postgres");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((s) => s.slug.includes("supabase"))).toBe(true);
  });
});

describe("Curated Advanced GitHub Repositories", () => {
  it("contains high-value verified open source repositories", () => {
    const repos = getAllCuratedRepos();
    expect(repos.length).toBeGreaterThanOrEqual(25);
  });

  it("includes essential agent tools like claude-code and browser-use", () => {
    const repos = getAllCuratedRepos();
    const claudeCode = repos.find((r) => r.fullName === "anthropics/claude-code");
    const browserUse = repos.find((r) => r.fullName === "browser-use/browser-use");
    expect(claudeCode).toBeDefined();
    expect(browserUse).toBeDefined();
  });

  it("searches curated repos by keyword correctly", () => {
    const results = searchCuratedRepos("agent");
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("Universal Search Integration with Repos and Vault", () => {
  it("returns GITHUB_REPO matches in universal search", async () => {
    const result = await performUniversalSearch("claude", 5, { trackAnalytics: false });
    const repoGroup = result.groups.find((g) => g.type === "GITHUB_REPO");
    expect(repoGroup).toBeDefined();
    expect(repoGroup?.results.length).toBeGreaterThan(0);
    expect(repoGroup?.results[0].title).toContain("Claude Code");
  });

  it("returns SKILL matches in universal search", async () => {
    const result = await performUniversalSearch("supabase", 5, { trackAnalytics: false });
    const skillGroup = result.groups.find((g) => g.type === "SKILL");
    expect(skillGroup).toBeDefined();
    expect(skillGroup?.results.length).toBeGreaterThan(0);
  });
});
