import type {
  TemplateCtaSystemV1,
  TemplateDesignDensityV1,
  TemplateOfferV1,
  TemplatePricingLogicV1,
  TemplateSectionV1,
  TemplateSectionTypeV1,
  TemplateStylePresetV1,
} from "../builder/schema/v1";

export type RuntimeSectionType = TemplateSectionTypeV1;

export type RuntimeStylePreset = TemplateStylePresetV1;

export type RuntimeDesignDensity = TemplateDesignDensityV1;

export type RuntimeSection = TemplateSectionV1;

export interface RuntimeManifest {
  version: "1";
  schemaVersion: "v1";
  templateId?: string;
  templateName: string;
  pageType: string;
  positioning: string;
  targetAudience: string;
  offer: TemplateOfferV1;
  ctaSystem: TemplateCtaSystemV1;
  pricingLogic: TemplatePricingLogicV1;
  stylePreset: RuntimeStylePreset;
  designDensity: RuntimeDesignDensity;
  sections: RuntimeSection[];
}

export interface RuntimeStyleTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  maxWidth: string;
  sectionPadding: string;
  radius: string;
}

export interface RuntimeValidationResult {
  manifest: RuntimeManifest | null;
  errors: string[];
}
