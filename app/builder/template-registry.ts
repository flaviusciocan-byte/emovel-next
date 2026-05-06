import {
  SECTION_TYPES,
  TEMPLATE_IDS,
  type TemplateDesignDensityV1,
  type TemplateIdV1,
  type TemplateSectionTypeV1,
  type TemplateStylePresetV1,
} from "./schema/v1";

export interface TemplateRegistryEntry {
  templateId: TemplateIdV1;
  label: string;
  category:
    | "landing"
    | "product"
    | "sales"
    | "campaign"
    | "authority"
    | "capture"
    | "audit"
    | "program";
  defaultPageType: string;
  allowedSections: TemplateSectionTypeV1[];
  recommendedDensity: TemplateDesignDensityV1;
  recommendedStylePreset: TemplateStylePresetV1;
}

const allSections = [...SECTION_TYPES];

export const TEMPLATE_REGISTRY: Record<TemplateIdV1, TemplateRegistryEntry> = {
  AGENT_PRIME: {
    templateId: "AGENT_PRIME",
    label: "Agent Prime",
    category: "landing",
    defaultPageType: "premium_ai_agent_landing_page",
    allowedSections: allSections,
    recommendedDensity: "premium",
    recommendedStylePreset: "premium-dark",
  },
  PRODUCT_VAULT: {
    templateId: "PRODUCT_VAULT",
    label: "Product Vault",
    category: "product",
    defaultPageType: "digital_template_shop_product_page",
    allowedSections: allSections,
    recommendedDensity: "dense",
    recommendedStylePreset: "premium-dark",
  },
  OFFER_SOVEREIGN: {
    templateId: "OFFER_SOVEREIGN",
    label: "Offer Sovereign",
    category: "sales",
    defaultPageType: "consultant_high_ticket_offer_page",
    allowedSections: allSections,
    recommendedDensity: "premium",
    recommendedStylePreset: "premium-dark",
  },
  CAMPAIGN_SIGNAL: {
    templateId: "CAMPAIGN_SIGNAL",
    label: "Campaign Signal",
    category: "campaign",
    defaultPageType: "instagram_campaign_launch_page",
    allowedSections: allSections,
    recommendedDensity: "focused",
    recommendedStylePreset: "editorial-warm",
  },
  TOOL_PRIME: {
    templateId: "TOOL_PRIME",
    label: "Tool Prime",
    category: "landing",
    defaultPageType: "saas_micro_product_landing_page",
    allowedSections: allSections,
    recommendedDensity: "premium",
    recommendedStylePreset: "premium-dark",
  },
  FOUNDER_SIGNAL: {
    templateId: "FOUNDER_SIGNAL",
    label: "Founder Signal",
    category: "authority",
    defaultPageType: "personal_brand_authority_page",
    allowedSections: allSections,
    recommendedDensity: "premium",
    recommendedStylePreset: "premium-dark",
  },
  LEAD_MAGNET_CORE: {
    templateId: "LEAD_MAGNET_CORE",
    label: "Lead Magnet Core",
    category: "capture",
    defaultPageType: "lead_magnet_capture_page",
    allowedSections: allSections,
    recommendedDensity: "focused",
    recommendedStylePreset: "light-clean",
  },
  AUDIT_ENGINE: {
    templateId: "AUDIT_ENGINE",
    label: "Audit Engine",
    category: "audit",
    defaultPageType: "paid_audit_offer_page",
    allowedSections: allSections,
    recommendedDensity: "dense",
    recommendedStylePreset: "premium-dark",
  },
  BUNDLE_ARCHIVE: {
    templateId: "BUNDLE_ARCHIVE",
    label: "Bundle Archive",
    category: "product",
    defaultPageType: "premium_digital_bundle_page",
    allowedSections: allSections,
    recommendedDensity: "premium",
    recommendedStylePreset: "editorial-warm",
  },
  PROGRAM_ASCENT: {
    templateId: "PROGRAM_ASCENT",
    label: "Program Ascent",
    category: "program",
    defaultPageType: "course_cohort_program_page",
    allowedSections: allSections,
    recommendedDensity: "premium",
    recommendedStylePreset: "premium-dark",
  },
};

export function isTemplateId(value: unknown): value is TemplateIdV1 {
  return typeof value === "string" && TEMPLATE_IDS.includes(value as TemplateIdV1);
}

export function getTemplateMeta(templateId: unknown) {
  return isTemplateId(templateId) ? TEMPLATE_REGISTRY[templateId] : null;
}
