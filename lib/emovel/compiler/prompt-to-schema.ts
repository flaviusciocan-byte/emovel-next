import { createProductBriefFromPromptV0, type PromptToBriefInputV0 } from "./prompt-to-brief";
import { EMOVEL_OUTPUT_CHECKLIST_V0 } from "../qa/output-checklist";
import { EMOVEL_COMPONENT_REGISTRY_V0 } from "../registry/components.registry";
import {
  EMOVEL_APP_SCHEMA_VERSION,
  type EmovelGeneratedAppSchemaV0,
} from "../schema/app-schema.v0";
import { getDefaultThemePackV0 } from "../themes/theme-packs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function createAppSchemaFromPromptV0(input: PromptToBriefInputV0): EmovelGeneratedAppSchemaV0 {
  const productBrief = createProductBriefFromPromptV0(input);
  const slug = slugify(productBrief.title) || "emovel-generated-app";
  const primaryActionId = "start-primary-flow";

  return {
    schemaVersion: EMOVEL_APP_SCHEMA_VERSION,
    project: {
      id: slug,
      name: productBrief.title,
      slug,
      category: input.category ?? "commerce",
      sourcePrompt: input.prompt,
      productBrief,
      generatedAt: new Date().toISOString(),
    },
    audience: {
      primarySegment: "Premium digital product buyers and operators.",
      sophistication: "advanced",
      pains: ["Unstructured product ideas", "Slow app planning", "Inconsistent commercial flow"],
      desiredOutcomes: ["Clear product brief", "Structured screen map", "Build-ready schema"],
      locales: ["en"],
      accessibilityNotes: ["Preserve semantic structure in future UI generation."],
    },
    monetization: {
      model: "one-time",
      currency: "USD",
      checkoutProvider: "gumroad",
      offers: [
        {
          id: "primary-offer",
          name: "Primary Digital Product",
          priceAnchor: "TBD",
          deliverables: ["Generated app brief", "Screen map", "Component map", "Theme pack"],
          callToActionId: primaryActionId,
        },
      ],
      notes: "Checkout is declared as intent only. No payment integration is executed here.",
    },
    screens: [
      {
        id: "home",
        name: "Home",
        route: "/",
        intent: "Present the core offer and guide the user into the primary conversion path.",
        priority: "primary",
        sections: ["hero", "offer", "pricing", "faq"],
        componentIds: EMOVEL_COMPONENT_REGISTRY_V0.map((entry) => entry.component.id),
        actionIds: [primaryActionId],
      },
    ],
    components: EMOVEL_COMPONENT_REGISTRY_V0.map((entry) => entry.component),
    theme: getDefaultThemePackV0(),
    actions: [
      {
        id: primaryActionId,
        type: "checkout",
        label: "Start",
        sourceScreenId: "home",
        target: "gumroad-product-url-placeholder",
        requiresAuth: false,
        metadata: {
          integrationStatus: "placeholder",
        },
      },
    ],
    dataModel: {
      persistence: "none",
      notes: "Data entities are declared for planning only. No database integration is created.",
      entities: [
        {
          id: "lead",
          name: "Lead",
          description: "A qualified user entering the commercial flow.",
          fields: [
            {
              name: "email",
              type: "string",
              required: true,
              description: "Contact email for follow-up or fulfillment.",
            },
            {
              name: "intent",
              type: "string",
              required: false,
              description: "Stated reason for entering the product flow.",
            },
          ],
        },
      ],
    },
    exportTargets: [
      {
        target: "json-schema",
        enabled: true,
        notes: "Primary output for the App Factory foundation.",
      },
      {
        target: "component-map",
        enabled: true,
        notes: "Maps generated screens to internal component intentions.",
      },
      {
        target: "next-app",
        enabled: false,
        notes: "Deferred until UI generation is explicitly requested.",
      },
    ],
    qaChecklist: EMOVEL_OUTPUT_CHECKLIST_V0,
  };
}
