import { describe, expect, it } from "vitest";

import { loadKnowledgeForModule } from "../../lib/emovel-core/knowledge-loader";

describe("EMOVEL knowledge loader", () => {
  it("loads primary and supporting markdown content for a module", async () => {
    const knowledge = await loadKnowledgeForModule("brand_system");

    expect(knowledge.moduleId).toBe("brand_system");
    expect(knowledge.primary.map((document) => document.id)).toEqual(["brand_os"]);
    expect(knowledge.supporting.map((document) => document.id)).toEqual([
      "copywriting_standard",
      "visual_direction",
      "automation_playbook",
    ]);
    expect(knowledge.primary[0].content).toContain("# EMOVEL Brand OS");
    expect(knowledge.primary[0].content).toContain("How EMOVEL AI Should Use This File");
  });

  it("preserves registry ordering and usage groups", async () => {
    const knowledge = await loadKnowledgeForModule("landing_page_builder");

    expect(knowledge.primary.map((document) => document.id)).toEqual([
      "offer_framework",
      "copywriting_standard",
      "visual_direction",
    ]);
    expect(knowledge.supporting.map((document) => document.id)).toEqual([
      "brand_os",
      "product_templates",
      "automation_playbook",
    ]);
    expect(knowledge.primary.every((document) => document.content.length > 1000)).toBe(true);
    expect(knowledge.supporting.every((document) => document.content.length > 1000)).toBe(true);
  });
});
