import { describe, expect, it } from "vitest";

import {
  ALLOWED_KNOWLEDGE_PREVIEW_MODULES,
  createKnowledgeInjectionPreview,
  isAllowedKnowledgePreviewModule,
} from "../../lib/emovel-core/knowledge-injection-preview";

describe("EMOVEL knowledge injection preview", () => {
  it("allows only the supported knowledge preview modules", () => {
    expect(ALLOWED_KNOWLEDGE_PREVIEW_MODULES).toEqual([
      "brand_system",
      "offer_builder",
      "landing_page_builder",
      "instagram_builder",
      "product_builder",
      "automation_engine",
    ]);
    expect(isAllowedKnowledgePreviewModule("brand_system")).toBe(true);
    expect(isAllowedKnowledgePreviewModule("unknown_module")).toBe(false);
  });

  it("returns the prompt section preview for a selected module", async () => {
    const preview = await createKnowledgeInjectionPreview("offer_builder", {
      maxCharactersPerDocument: 650,
      maxPromptCharacters: 10_000,
    });

    expect(preview.moduleId).toBe("offer_builder");
    expect(preview.documentIds).toEqual([
      "offer_framework",
      "brand_os",
      "copywriting_standard",
      "product_templates",
      "visual_direction",
    ]);
    expect(preview.documentCount).toBe(5);
    expect(preview.promptSection).toContain("<EMOVEL_KNOWLEDGE_CONTEXT>");
    expect(preview.promptSection).toContain("module_id: offer_builder");
    expect(preview.promptSection).toContain("### PRIMARY: EMOVEL Offer Framework");
    expect(preview.truncatedDocumentIds).toContain("offer_framework");
    expect(preview.promptWasTruncated).toBe(false);
  });

  it("rejects unsupported modules before building a prompt section", async () => {
    await expect(createKnowledgeInjectionPreview("billing_dashboard")).rejects.toThrow(
      "Unsupported EMOVEL knowledge preview module: billing_dashboard",
    );
  });

  it("reports full prompt truncation metadata", async () => {
    const preview = await createKnowledgeInjectionPreview("product_builder", {
      maxCharactersPerDocument: 1_000,
      maxPromptCharacters: 1_200,
    });

    expect(preview.promptWasTruncated).toBe(true);
    expect(preview.promptSection).toContain("[Knowledge prompt section truncated.]");
  });
});
