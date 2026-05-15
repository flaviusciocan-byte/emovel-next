import { describe, expect, it } from "vitest";

import { createProductBriefFromPromptV0 } from "../../lib/emovel/compiler/prompt-to-brief";
import { createAppSchemaFromPromptV0 } from "../../lib/emovel/compiler/prompt-to-schema";
import { validateEmovelAppSchemaV0 as validateAppSchemaV0 } from "../../lib/emovel/schema/validate-app-schema.v0";

describe("EMOVEL App Factory foundation", () => {
  it("creates a product brief from a prompt", () => {
    const brief = createProductBriefFromPromptV0({
      prompt: " Build a premium prompt system shop for founders. ",
      category: "commerce",
      constraints: ["Keep Gumroad as checkout intent."],
    });

    expect(brief.title).toBe("Build a premium prompt system shop for founders");
    expect(brief.summary).toBe("Build a premium prompt system shop for founders.");
    expect(brief.primaryUseCase).toBe("commerce");
    expect(brief.constraints).toContain("Keep Gumroad as checkout intent.");
  });

  it("creates a valid app schema from a prompt", () => {
    const schema = createAppSchemaFromPromptV0({
      prompt: "Create an internal operator console for premium template production.",
      category: "internal-tool",
    });

    expect(schema.schemaVersion).toBe("emovel-app-schema.v0");
    expect(schema.project.slug).toBe("create-an-internal-operator-console-for-premium-template-product");
    expect(schema.screens).toHaveLength(1);
    expect(schema.screens[0]?.componentIds.length).toBeGreaterThan(0);
    expect(schema.components.length).toBeGreaterThan(0);
    expect(schema.theme.packId).toBe("emovel-black-gold");
    expect(schema.exportTargets.some((target) => target.target === "json-schema")).toBe(true);
    expect(Date.parse(schema.project.generatedAt)).not.toBeNaN();
  });

  it("validates a complete app schema", () => {
    const schema = createAppSchemaFromPromptV0({
      prompt: "Create a premium commercial app foundation.",
    });

    expect(validateAppSchemaV0(schema)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("returns validation errors for missing required foundations", () => {
    const result = validateAppSchemaV0({
      project: {},
      screens: [
        {
          id: "home",
          componentIds: [],
        },
      ],
      components: [
        {
          id: "broken-component",
          type: "unknown",
        },
      ],
      exportTargets: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining([
        "audience",
        "monetization",
        "theme",
        "screens[0].componentIds",
        "components[0].type",
        "components[0].props",
        "exportTargets",
        "qaChecklist",
      ]),
    );
  });
});
