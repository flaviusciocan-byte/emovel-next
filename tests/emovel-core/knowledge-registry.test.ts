import { describe, expect, it } from "vitest";

import {
  EMOVEL_KNOWLEDGE_DOCUMENTS,
  EMOVEL_KNOWLEDGE_MODULES,
  type EmovelKnowledgeModuleId,
  getKnowledgeForModule,
} from "../../lib/emovel-core/knowledge-registry";

const expectedDocumentIds = [
  "brand_os",
  "offer_framework",
  "instagram_system",
  "product_templates",
  "copywriting_standard",
  "visual_direction",
  "automation_playbook",
];

const expectedModuleIds: EmovelKnowledgeModuleId[] = [
  "brand_system",
  "offer_builder",
  "landing_page_builder",
  "instagram_builder",
  "product_builder",
  "automation_engine",
];

describe("EMOVEL knowledge registry", () => {
  it("registers all EMOVEL Core documents with metadata only", () => {
    expect(EMOVEL_KNOWLEDGE_DOCUMENTS.map((document) => document.id)).toEqual(
      expectedDocumentIds,
    );

    EMOVEL_KNOWLEDGE_DOCUMENTS.forEach((document) => {
      expect(document.filePath).toMatch(/^docs\/emovel-core\/\d{2}_EMOVEL_.+\.md$/);
      expect(document.purpose.length).toBeGreaterThan(40);
      expect(document.applicableModules.length).toBeGreaterThan(0);
      expect(document).not.toHaveProperty("content");
    });
  });

  it("maps every future AI module to primary and supporting knowledge", () => {
    expect(EMOVEL_KNOWLEDGE_MODULES.map((moduleEntry) => moduleEntry.moduleId)).toEqual(
      expectedModuleIds,
    );

    expectedModuleIds.forEach((moduleId) => {
      const knowledge = getKnowledgeForModule(moduleId);

      expect(knowledge.primary.length).toBeGreaterThan(0);
      expect(knowledge.supporting.length).toBeGreaterThan(0);
    });
  });

  it("returns the expected primary documents for each module", () => {
    expect(getKnowledgeForModule("brand_system").primary.map((document) => document.id)).toEqual([
      "brand_os",
    ]);
    expect(getKnowledgeForModule("offer_builder").primary.map((document) => document.id)).toEqual([
      "offer_framework",
    ]);
    expect(
      getKnowledgeForModule("landing_page_builder").primary.map((document) => document.id),
    ).toEqual(["offer_framework", "copywriting_standard", "visual_direction"]);
    expect(
      getKnowledgeForModule("instagram_builder").primary.map((document) => document.id),
    ).toEqual(["instagram_system"]);
    expect(getKnowledgeForModule("product_builder").primary.map((document) => document.id)).toEqual([
      "product_templates",
    ]);
    expect(
      getKnowledgeForModule("automation_engine").primary.map((document) => document.id),
    ).toEqual(["automation_playbook"]);
  });

  it("returns new arrays so callers cannot mutate registry groups", () => {
    const firstRead = getKnowledgeForModule("offer_builder");

    firstRead.primary.pop();
    firstRead.supporting.pop();

    const secondRead = getKnowledgeForModule("offer_builder");

    expect(secondRead.primary.map((document) => document.id)).toEqual(["offer_framework"]);
    expect(secondRead.supporting.map((document) => document.id)).toEqual([
      "brand_os",
      "copywriting_standard",
      "product_templates",
      "visual_direction",
    ]);
  });
});
