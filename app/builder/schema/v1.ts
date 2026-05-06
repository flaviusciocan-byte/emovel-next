export const TEMPLATE_IDS = [
  "AGENT_PRIME",
  "PRODUCT_VAULT",
  "OFFER_SOVEREIGN",
  "CAMPAIGN_SIGNAL",
  "TOOL_PRIME",
  "FOUNDER_SIGNAL",
  "LEAD_MAGNET_CORE",
  "AUDIT_ENGINE",
  "BUNDLE_ARCHIVE",
  "PROGRAM_ASCENT",
] as const;

export const STYLE_PRESETS = ["premium-dark", "light-clean", "editorial-warm"] as const;

export const DESIGN_DENSITIES = ["focused", "premium", "dense"] as const;

export const SECTION_TYPES = [
  "hero",
  "problem",
  "mechanism",
  "offer",
  "benefits",
  "features",
  "proof",
  "pricing",
  "comparison",
  "process",
  "faq",
  "finalCta",
  "footer",
] as const;

export const COMPONENT_TYPES = [
  "headline",
  "subheadline",
  "eyebrow",
  "button",
  "badge",
  "card",
  "featureGrid",
  "pricingBlock",
  "testimonialBlock",
  "mediaFrame",
  "comparisonTable",
  "timeline",
  "faqAccordion",
  "statsRow",
  "logoStrip",
  "formBlock",
  "checkoutBlock",
] as const;

export const PRICING_MODELS = [
  "none",
  "one-time",
  "tiered",
  "subscription",
  "application",
] as const;

export type TemplateIdV1 = (typeof TEMPLATE_IDS)[number];
export type TemplateStylePresetV1 = (typeof STYLE_PRESETS)[number];
export type TemplateDesignDensityV1 = (typeof DESIGN_DENSITIES)[number];
export type TemplateSectionTypeV1 = (typeof SECTION_TYPES)[number];
export type TemplateComponentTypeV1 = (typeof COMPONENT_TYPES)[number];
export type TemplatePricingModelV1 = (typeof PRICING_MODELS)[number];

export interface TemplateOfferV1 {
  type: string;
  deliverable: string;
  format: string;
}

export interface TemplateCtaSystemV1 {
  primaryCtaLabel: string;
  primaryCtaAction: string;
  secondaryCtaLabel: string;
  secondaryCtaAction: string;
}

export interface TemplatePricingLogicV1 {
  hasPricing: boolean;
  pricingModel: TemplatePricingModelV1;
  priceAnchors: string[];
  justification: string;
}

export interface TemplateBuilderNotesV1 {
  recommendedFor: string;
  avoid: string;
  scalability: string;
}

export interface TemplateSectionV1 {
  id: string;
  type: TemplateSectionTypeV1;
  title: string;
  objective: string;
  components: TemplateComponentTypeV1[];
}

export interface TemplateSpecV1 {
  schemaVersion: "v1";
  templateId: TemplateIdV1;
  templateName: string;
  pageType: string;
  positioning: string;
  targetAudience: string;
  offer: TemplateOfferV1;
  stylePreset: TemplateStylePresetV1;
  designDensity: TemplateDesignDensityV1;
  ctaSystem: TemplateCtaSystemV1;
  pricingLogic: TemplatePricingLogicV1;
  builderNotes: TemplateBuilderNotesV1;
  sections: TemplateSectionV1[];
}

export interface TemplateSpecValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  readinessScore: number;
}

const topLevelFields = new Set([
  "schemaVersion",
  "templateId",
  "templateName",
  "pageType",
  "positioning",
  "targetAudience",
  "offer",
  "stylePreset",
  "designDensity",
  "ctaSystem",
  "pricingLogic",
  "builderNotes",
  "sections",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function includesValue<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

function validateTextField(
  source: Record<string, unknown>,
  key: string,
  label: string,
  errors: string[],
) {
  if (!hasText(source[key])) {
    errors.push(`${label} is required.`);
  }
}

export function validateTemplateSpecV1(value: unknown): TemplateSpecValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return {
      isValid: false,
      errors: ["Template spec must be an object."],
      warnings,
      readinessScore: 0,
    };
  }

  Object.keys(value).forEach((key) => {
    if (!topLevelFields.has(key)) {
      warnings.push(`Unknown top-level field "${key}" will be ignored by Builder v1.`);
    }
  });

  if (!("schemaVersion" in value)) {
    errors.push("schemaVersion is required.");
  } else if (value.schemaVersion !== "v1") {
    errors.push('schemaVersion must be "v1".');
  }

  if (!includesValue(TEMPLATE_IDS, value.templateId)) {
    errors.push("templateId must be one of the supported Template Spec v1 IDs.");
  }

  validateTextField(value, "templateName", "templateName", errors);
  validateTextField(value, "pageType", "pageType", errors);
  validateTextField(value, "positioning", "positioning", errors);
  validateTextField(value, "targetAudience", "targetAudience", errors);

  if (!isRecord(value.offer)) {
    errors.push("offer must be an object with type, deliverable, and format.");
  } else {
    validateTextField(value.offer, "type", "offer.type", errors);
    validateTextField(value.offer, "deliverable", "offer.deliverable", errors);
    validateTextField(value.offer, "format", "offer.format", errors);
  }

  if (!includesValue(STYLE_PRESETS, value.stylePreset)) {
    errors.push("stylePreset must be premium-dark, light-clean, or editorial-warm.");
  }

  if (!includesValue(DESIGN_DENSITIES, value.designDensity)) {
    errors.push("designDensity must be focused, premium, or dense.");
  }

  if (!isRecord(value.ctaSystem)) {
    errors.push("ctaSystem is required.");
  } else {
    validateTextField(value.ctaSystem, "primaryCtaLabel", "ctaSystem.primaryCtaLabel", errors);
    validateTextField(value.ctaSystem, "primaryCtaAction", "ctaSystem.primaryCtaAction", errors);
    validateTextField(value.ctaSystem, "secondaryCtaLabel", "ctaSystem.secondaryCtaLabel", errors);
    validateTextField(value.ctaSystem, "secondaryCtaAction", "ctaSystem.secondaryCtaAction", errors);
  }

  if (!isRecord(value.pricingLogic)) {
    errors.push("pricingLogic is required.");
  } else {
    if (typeof value.pricingLogic.hasPricing !== "boolean") {
      errors.push("pricingLogic.hasPricing must be a boolean.");
    }

    if (!includesValue(PRICING_MODELS, value.pricingLogic.pricingModel)) {
      errors.push("pricingLogic.pricingModel must be one of: none, one-time, tiered, subscription, application.");
    }

    if (!Array.isArray(value.pricingLogic.priceAnchors)) {
      errors.push("pricingLogic.priceAnchors must be an array.");
    } else {
      value.pricingLogic.priceAnchors.forEach((anchor, index) => {
        if (!hasText(anchor)) {
          errors.push(`pricingLogic.priceAnchors[${index}] must be a non-empty string.`);
        }
      });
    }

    validateTextField(value.pricingLogic, "justification", "pricingLogic.justification", errors);
  }

  if (!isRecord(value.builderNotes)) {
    errors.push("builderNotes is required.");
  } else {
    validateTextField(value.builderNotes, "recommendedFor", "builderNotes.recommendedFor", errors);
    validateTextField(value.builderNotes, "avoid", "builderNotes.avoid", errors);
    validateTextField(value.builderNotes, "scalability", "builderNotes.scalability", errors);
  }

  if (!Array.isArray(value.sections) || value.sections.length === 0) {
    errors.push("sections must be a non-empty array.");
  } else {
    const sectionIds = new Set<string>();

    value.sections.forEach((section, index) => {
      if (!isRecord(section)) {
        errors.push(`sections[${index}] must be an object.`);
        return;
      }

      const label = hasText(section.id) ? section.id : `sections[${index}]`;

      const sectionId = typeof section.id === "string" ? section.id : "";

      if (!hasText(sectionId)) {
        errors.push(`sections[${index}].id is required.`);
      } else if (sectionIds.has(sectionId)) {
        errors.push(`Duplicate section id "${sectionId}".`);
      } else {
        sectionIds.add(sectionId);
      }

      if (!includesValue(SECTION_TYPES, section.type)) {
        errors.push(`${label}.type is not a supported Template Spec v1 section type.`);
      }

      validateTextField(section, "title", `${label}.title`, errors);
      validateTextField(section, "objective", `${label}.objective`, errors);

      if (!Array.isArray(section.components)) {
        errors.push(`${label}.components must be an array.`);
      } else {
        section.components.forEach((component, componentIndex) => {
          if (!includesValue(COMPONENT_TYPES, component)) {
            errors.push(`${label}.components[${componentIndex}] is not a supported component name.`);
          }
        });
      }
    });
  }

  const readinessScore = Math.max(0, 100 - errors.length * 8 - warnings.length * 3);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    readinessScore,
  };
}

export function isTemplateSpecV1(value: unknown): value is TemplateSpecV1 {
  return validateTemplateSpecV1(value).isValid;
}
