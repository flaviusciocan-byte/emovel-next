import {
  COMPONENT_TYPES,
  DESIGN_DENSITIES,
  PRICING_MODELS,
  SECTION_TYPES,
  STYLE_PRESETS,
  type TemplateComponentTypeV1,
  type TemplatePricingModelV1,
  type TemplateSectionTypeV1,
} from "../builder/schema/v1";
import type {
  RuntimeDesignDensity,
  RuntimeManifest,
  RuntimeSection,
  RuntimeStylePreset,
  RuntimeValidationResult,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(source: Record<string, unknown>, key: string, fallback = "") {
  return typeof source[key] === "string" ? source[key] : fallback;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeOffer(value: unknown) {
  if (isRecord(value)) {
    return {
      type: getString(value, "type", "digital_product_system"),
      deliverable: getString(value, "deliverable", "Structured execution system."),
      format: getString(value, "format", "single_page_runtime_preview"),
    };
  }

  return {
    type: "legacy_offer",
    deliverable: typeof value === "string" ? value : "Structured execution system.",
    format: "legacy_builder_spec",
  };
}

function normalizeCtaSystem(value: unknown) {
  if (isRecord(value)) {
    return {
      primaryCtaLabel: getString(value, "primaryCtaLabel", "Enter The System"),
      primaryCtaAction: getString(value, "primaryCtaAction", "primary_action"),
      secondaryCtaLabel: getString(value, "secondaryCtaLabel", "Review Details"),
      secondaryCtaAction: getString(value, "secondaryCtaAction", "secondary_action"),
    };
  }

  return {
    primaryCtaLabel: "Enter The System",
    primaryCtaAction: "primary_action",
    secondaryCtaLabel: "Review Details",
    secondaryCtaAction: "secondary_action",
  };
}

function normalizePricingLogic(value: unknown) {
  if (isRecord(value)) {
    const pricingModel = PRICING_MODELS.includes(value.pricingModel as TemplatePricingModelV1)
      ? (value.pricingModel as TemplatePricingModelV1)
      : "none";

    return {
      hasPricing: typeof value.hasPricing === "boolean" ? value.hasPricing : false,
      pricingModel,
      priceAnchors: isStringArray(value.priceAnchors) ? value.priceAnchors : [],
      justification: getString(value, "justification", "Pricing is not configured for this preview."),
    };
  }

  return {
    hasPricing: false,
    pricingModel: "none" as const,
    priceAnchors: [],
    justification: "Pricing is not configured for this preview.",
  };
}

function normalizeSection(value: unknown, index: number, errors: string[]): RuntimeSection | null {
  if (!isRecord(value)) {
    errors.push(`Section ${index + 1} must be an object.`);
    return null;
  }

  const rawType = getString(value, "type", "");

  if (!SECTION_TYPES.includes(rawType as TemplateSectionTypeV1)) {
    errors.push(`Section ${index + 1} has unsupported type "${rawType}".`);
    return null;
  }

  const rawComponents = Array.isArray(value.components) ? value.components : [];
  const components: TemplateComponentTypeV1[] = [];

  rawComponents.forEach((component, componentIndex) => {
    if (COMPONENT_TYPES.includes(component as TemplateComponentTypeV1)) {
      components.push(component as TemplateComponentTypeV1);
    } else {
      errors.push(`Section ${index + 1} component ${componentIndex + 1} is unsupported.`);
    }
  });

  return {
    id: getString(value, "id", `section-${index + 1}`),
    type: rawType as TemplateSectionTypeV1,
    title: getString(value, "title", `Section ${index + 1}`),
    objective: getString(value, "objective", "Define the purpose of this runtime section."),
    components,
  };
}

export function normalizeRuntimeManifest(input: unknown): RuntimeValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { manifest: null, errors: ["Manifest must be an object."] };
  }

  const source = isRecord(input.spec) ? input.spec : input;
  const rawSections = Array.isArray(source.sections) ? source.sections : [];
  const sections = rawSections
    .map((section, index) => normalizeSection(section, index, errors))
    .filter((section): section is RuntimeSection => Boolean(section));

  if (rawSections.length === 0) {
    errors.push("Manifest requires at least one section.");
  }

  const rawStylePreset = getString(source, "stylePreset", "premium-dark");
  const stylePreset = STYLE_PRESETS.includes(rawStylePreset as RuntimeStylePreset)
    ? (rawStylePreset as RuntimeStylePreset)
    : "premium-dark";

  const rawDensity = getString(source, "designDensity", "premium");
  const designDensity = DESIGN_DENSITIES.includes(rawDensity as RuntimeDesignDensity)
    ? (rawDensity as RuntimeDesignDensity)
    : "premium";

  const manifest: RuntimeManifest = {
    version: "1",
    schemaVersion: "v1",
    templateId: getString(source, "templateId", ""),
    templateName: getString(source, "templateName", "emovel-system"),
    pageType: getString(source, "pageType", "landing_page"),
    positioning: getString(source, "positioning", "Controlled digital product system."),
    targetAudience: getString(source, "targetAudience", "Qualified digital product buyers."),
    offer: normalizeOffer(source.offer),
    ctaSystem: normalizeCtaSystem(source.ctaSystem),
    pricingLogic: normalizePricingLogic(source.pricingLogic),
    stylePreset,
    designDensity,
    sections,
  };

  return {
    manifest: errors.length > 0 ? null : manifest,
    errors,
  };
}
