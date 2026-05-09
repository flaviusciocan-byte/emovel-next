import { describe, expect, it } from "vitest";

import {
  buildKnowledgePromptSectionForModule,
  formatKnowledgePromptSection,
} from "../../lib/emovel-core/knowledge-prompt-adapter";

describe("EMOVEL knowledge prompt adapter", () => {
  it("formats module knowledge into a prompt-safe block with clear boundaries", async () => {
    const section = await buildKnowledgePromptSectionForModule("brand_system", {
      maxCharactersPerDocument: 700,
      maxPromptCharacters: 10_000,
    });

    expect(section.moduleId).toBe("brand_system");
    expect(section.documentCount).toBe(4);
    expect(section.documentIds).toEqual([
      "brand_os",
      "copywriting_standard",
      "visual_direction",
      "automation_playbook",
    ]);
    expect(section.promptSection).toContain("<EMOVEL_KNOWLEDGE_CONTEXT>");
    expect(section.promptSection).toContain("</EMOVEL_KNOWLEDGE_CONTEXT>");
    expect(section.promptSection).toContain("<EMOVEL_KNOWLEDGE_METADATA>");
    expect(section.promptSection).toContain("module_id: brand_system");
    expect(section.promptSection).toContain(
      "Instruction: Use this context to preserve EMOVEL standards.",
    );
    expect(section.truncatedDocumentIds).toContain("brand_os");
    expect(section.promptWasTruncated).toBe(false);
  });

  it("includes truncation metadata when documents are compacted", async () => {
    const section = await buildKnowledgePromptSectionForModule("instagram_builder", {
      maxCharactersPerDocument: 500,
      maxPromptCharacters: 12_000,
    });

    expect(section.truncatedDocumentIds).toEqual([
      "instagram_system",
      "copywriting_standard",
      "brand_os",
      "offer_framework",
      "visual_direction",
    ]);
    expect(section.promptSection).toContain(
      "truncated_document_ids: instagram_system, copywriting_standard, brand_os, offer_framework, visual_direction",
    );
    expect(section.promptSection).toContain("[Content truncated for compact context.]");
  });

  it("can hard-limit the full prompt section", () => {
    const section = formatKnowledgePromptSection(
      {
        moduleId: "offer_builder",
        documentCount: 1,
        truncatedDocumentIds: [],
        contextBlock: [
          "## EMOVEL Knowledge Core Context",
          "Module: offer_builder",
          "Document ID: offer_framework",
          "A".repeat(2_000),
        ].join("\n"),
      },
      {
        maxPromptCharacters: 500,
      },
    );

    expect(section.documentIds).toEqual(["offer_framework"]);
    expect(section.promptWasTruncated).toBe(true);
    expect(section.promptSection.length).toBeLessThan(600);
    expect(section.promptSection).toContain("[Knowledge prompt section truncated.]");
  });
});
