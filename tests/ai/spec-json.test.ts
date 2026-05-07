import { describe, expect, it } from "vitest";

import { parseTemplateSpecFromText } from "../../lib/ai/spec-json";
import type { TemplateSpecV1 } from "../../app/builder/schema/v1";

const validSpec: TemplateSpecV1 = {
  schemaVersion: "v1",
  templateId: "TOOL_PRIME",
  templateName: "Tool Prime",
  pageType: "saas_micro_product_landing_page",
  positioning: "A premium commercial page for a focused digital product.",
  targetAudience: "Founders and operators who need a controlled product presentation.",
  offer: {
    type: "digital_product",
    deliverable: "Premium product page structure",
    format: "single_page",
  },
  stylePreset: "premium-dark",
  designDensity: "focused",
  ctaSystem: {
    primaryCtaLabel: "Generate page",
    primaryCtaAction: "generate_page",
    secondaryCtaLabel: "Review structure",
    secondaryCtaAction: "review_structure",
  },
  pricingLogic: {
    hasPricing: false,
    pricingModel: "none",
    priceAnchors: [],
    justification: "Pricing is intentionally omitted for this neutral runtime preview.",
  },
  builderNotes: {
    recommendedFor: "Premium product validation pages.",
    avoid: "Generic SaaS positioning.",
    scalability: "Can extend into pricing and proof sections later.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Product opening",
      objective: "Establish commercial clarity and invite the primary action.",
      components: ["eyebrow", "headline", "subheadline", "button"],
    },
  ],
};

describe("parseTemplateSpecFromText", () => {
  it("parses a valid Template Spec v1 JSON object", () => {
    expect(parseTemplateSpecFromText(JSON.stringify(validSpec))).toEqual(validSpec);
  });

  it("parses a valid Template Spec v1 object inside a JSON code fence", () => {
    const parsed = parseTemplateSpecFromText(`\`\`\`json\n${JSON.stringify(validSpec)}\n\`\`\``);

    expect(parsed.templateId).toBe("TOOL_PRIME");
    expect(parsed.sections[0]?.type).toBe("hero");
  });

  it("fails safely when no JSON object is present", () => {
    expect(() => parseTemplateSpecFromText("not json")).toThrow("AI response did not contain a JSON object.");
  });

  it("fails safely when required Template Spec fields are missing", () => {
    const invalidSpec = {
      ...validSpec,
      templateName: "",
    };

    expect(() => parseTemplateSpecFromText(JSON.stringify(invalidSpec))).toThrow(
      /AI response failed Template Spec v1 validation/,
    );
  });
});
