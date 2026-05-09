import { describe, expect, it } from "vitest";

import {
  buildKnowledgeContextForModule,
  createKnowledgeContextBlock,
} from "../../lib/emovel-core/knowledge-context-builder";
import { loadKnowledgeForModule } from "../../lib/emovel-core/knowledge-loader";

describe("EMOVEL knowledge context builder", () => {
  it("builds a compact context block for a module using loaded knowledge", async () => {
    const context = await buildKnowledgeContextForModule("brand_system", {
      maxCharactersPerDocument: 900,
    });

    expect(context.moduleId).toBe("brand_system");
    expect(context.documentCount).toBe(4);
    expect(context.contextBlock).toContain("## EMOVEL Knowledge Core Context");
    expect(context.contextBlock).toContain("Module: brand_system");
    expect(context.contextBlock).toContain("### PRIMARY: EMOVEL Brand OS");
    expect(context.contextBlock).toContain("### SUPPORTING: EMOVEL Copywriting Standard");
    expect(context.contextBlock).toContain("Document ID: brand_os");
    expect(context.contextBlock).toContain("Purpose:");
    expect(context.contextBlock).toContain("[Content truncated for compact context.]");
    expect(context.truncatedDocumentIds).toContain("brand_os");
  });

  it("preserves primary documents before supporting documents", async () => {
    const context = await buildKnowledgeContextForModule("landing_page_builder", {
      maxCharactersPerDocument: 700,
    });

    const offerIndex = context.contextBlock.indexOf("### PRIMARY: EMOVEL Offer Framework");
    const copyIndex = context.contextBlock.indexOf("### PRIMARY: EMOVEL Copywriting Standard");
    const visualIndex = context.contextBlock.indexOf("### PRIMARY: EMOVEL Visual Direction");
    const brandIndex = context.contextBlock.indexOf("### SUPPORTING: EMOVEL Brand OS");

    expect(offerIndex).toBeGreaterThan(-1);
    expect(copyIndex).toBeGreaterThan(offerIndex);
    expect(visualIndex).toBeGreaterThan(copyIndex);
    expect(brandIndex).toBeGreaterThan(visualIndex);
  });

  it("can format already loaded knowledge without reloading documents", async () => {
    const loaded = await loadKnowledgeForModule("instagram_builder");
    const context = createKnowledgeContextBlock(loaded, {
      maxCharactersPerDocument: 1_200,
    });

    expect(context.moduleId).toBe("instagram_builder");
    expect(context.documentCount).toBe(5);
    expect(context.contextBlock).toContain("### PRIMARY: EMOVEL Instagram System");
    expect(context.contextBlock).toContain("### SUPPORTING: EMOVEL Offer Framework");
  });
});
