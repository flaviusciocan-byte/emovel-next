import { describe, expect, it } from "vitest";

import { buildTemplateSpecPrompt } from "../../lib/ai/builder-prompt";
import {
  getKnowledgeModuleForGeneration,
  getKnowledgePromptSectionForGeneration,
  isKnowledgeInjectionEnabled,
} from "../../lib/ai/knowledge-injection";
import type { BoundaryResult } from "../../lib/ai/boundary";
import type { ProjectWithSections } from "../../lib/emovel-ai/data-access";

const offerBoundary: BoundaryResult = {
  allowed: true,
  category: "monetization",
  confidence: 0.82,
  reason: "The request has a monetization or offer architecture intent.",
  normalizedIntent: "Build an offer page for a premium prompt pack.",
};

const brandBoundary: BoundaryResult = {
  allowed: true,
  category: "brand",
  confidence: 0.82,
  reason: "The request is centered on brand and positioning.",
  normalizedIntent: "Build brand positioning for a premium studio.",
};

const project = {
  id: "project_1",
  name: "Offer Project",
  product_type: "digital_product",
  commercial_goal: "sell_offer",
  fixed_section_order: ["hero"],
  sections: [],
} as unknown as ProjectWithSections;

describe("knowledge injection pilot", () => {
  it("keeps injection off by default", async () => {
    expect(isKnowledgeInjectionEnabled({} as NodeJS.ProcessEnv)).toBe(false);

    const section = await getKnowledgePromptSectionForGeneration({
      boundary: offerBoundary,
      env: {} as NodeJS.ProcessEnv,
      buildKnowledgePromptSection: async () => {
        throw new Error("Should not load knowledge when the feature flag is off.");
      },
    });

    expect(section).toBeNull();
  });

  it("injects offer_builder knowledge when the flag is enabled for offer generation", async () => {
    expect(getKnowledgeModuleForGeneration(offerBoundary)).toBe("offer_builder");

    const section = await getKnowledgePromptSectionForGeneration({
      boundary: offerBoundary,
      env: { ENABLE_KNOWLEDGE_INJECTION: "true" } as NodeJS.ProcessEnv,
      buildKnowledgePromptSection: async (moduleId) => ({
        moduleId,
        promptSection: "<EMOVEL_KNOWLEDGE_CONTEXT>offer builder context</EMOVEL_KNOWLEDGE_CONTEXT>",
        documentIds: ["offer_framework"],
        documentCount: 1,
        truncatedDocumentIds: [],
        promptWasTruncated: false,
      }),
    });

    const prompt = buildTemplateSpecPrompt({
      brief: "Build an offer page for a premium prompt pack.",
      boundary: offerBoundary,
      brandProfile: null,
      project,
      currentSpec: null,
      knowledgePromptSection: section,
    });

    expect(section).toContain("offer builder context");
    expect(prompt.system).toContain("<EMOVEL_KNOWLEDGE_CONTEXT>");
  });

  it("leaves non-offer modules unchanged even when the flag is enabled", async () => {
    expect(getKnowledgeModuleForGeneration(brandBoundary)).toBeNull();

    const section = await getKnowledgePromptSectionForGeneration({
      boundary: brandBoundary,
      env: { ENABLE_KNOWLEDGE_INJECTION: "true" } as NodeJS.ProcessEnv,
      buildKnowledgePromptSection: async () => {
        throw new Error("Should not load knowledge for non-offer generation.");
      },
    });

    const prompt = buildTemplateSpecPrompt({
      brief: "Build brand positioning for a premium studio.",
      boundary: brandBoundary,
      brandProfile: null,
      project,
      currentSpec: null,
      knowledgePromptSection: section,
    });

    expect(section).toBeNull();
    expect(prompt.system).not.toContain("<EMOVEL_KNOWLEDGE_CONTEXT>");
  });

  it("falls back safely when knowledge documents cannot be loaded", async () => {
    const section = await getKnowledgePromptSectionForGeneration({
      boundary: offerBoundary,
      env: { ENABLE_KNOWLEDGE_INJECTION: "true" } as NodeJS.ProcessEnv,
      buildKnowledgePromptSection: async () => {
        throw new Error("Missing knowledge document.");
      },
    });

    expect(section).toBeNull();
  });
});
