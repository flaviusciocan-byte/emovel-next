export const EMOVEL_APP_SCHEMA_VERSION = "emovel-app-schema.v0" as const;

export const APP_CATEGORIES = [
  "commerce",
  "content",
  "lead-generation",
  "member-portal",
  "internal-tool",
] as const;

export const MONETIZATION_MODELS = [
  "none",
  "one-time",
  "subscription",
  "tiered",
  "lead-capture",
] as const;

export const COMPONENT_TYPES = [
  "hero",
  "section",
  "feature-grid",
  "offer-card",
  "pricing-block",
  "checkout-cta",
  "form",
  "table",
  "list",
  "faq",
  "footer",
] as const;

export const ACTION_TYPES = [
  "navigate",
  "submit-form",
  "checkout",
  "download",
  "open-link",
  "capture-lead",
] as const;

export const EXPORT_TARGETS = [
  "next-app",
  "json-schema",
  "marketing-brief",
  "component-map",
  "theme-pack",
] as const;

export type EmovelAppCategoryV0 = (typeof APP_CATEGORIES)[number];
export type EmovelMonetizationModelV0 = (typeof MONETIZATION_MODELS)[number];
export type EmovelComponentTypeV0 = (typeof COMPONENT_TYPES)[number];
export type EmovelActionTypeV0 = (typeof ACTION_TYPES)[number];
export type EmovelExportTargetV0 = (typeof EXPORT_TARGETS)[number];

export interface EmovelProductBriefV0 {
  title: string;
  summary: string;
  problem: string;
  promise: string;
  primaryUseCase: string;
  positioning: string;
  constraints: string[];
}

export interface EmovelProjectInfoV0 {
  id: string;
  name: string;
  slug: string;
  category: EmovelAppCategoryV0;
  sourcePrompt: string;
  productBrief: EmovelProductBriefV0;
  generatedAt: string;
}

export interface EmovelAudienceV0 {
  primarySegment: string;
  sophistication: "beginner" | "intermediate" | "advanced" | "expert";
  pains: string[];
  desiredOutcomes: string[];
  locales: string[];
  accessibilityNotes: string[];
}

export interface EmovelMonetizationOfferV0 {
  id: string;
  name: string;
  priceAnchor: string;
  deliverables: string[];
  callToActionId: string;
}

export interface EmovelMonetizationV0 {
  model: EmovelMonetizationModelV0;
  currency: string;
  checkoutProvider: "none" | "gumroad" | "stripe" | "external";
  offers: EmovelMonetizationOfferV0[];
  notes: string;
}

export interface EmovelScreenV0 {
  id: string;
  name: string;
  route: string;
  intent: string;
  priority: "primary" | "secondary" | "support";
  sections: string[];
  componentIds: string[];
  actionIds: string[];
}

export interface EmovelComponentInstanceV0 {
  id: string;
  type: EmovelComponentTypeV0;
  screenId: string;
  name: string;
  purpose: string;
  props: Record<string, string | number | boolean | string[]>;
  dataBindings: string[];
  states: string[];
}

export interface EmovelThemeTokensV0 {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  border: string;
  radius: string;
  fontFamily: string;
}

export interface EmovelThemeV0 {
  packId: string;
  archetypeId: string;
  mode: "dark" | "light";
  tokens: EmovelThemeTokensV0;
  notes: string;
}

export interface EmovelActionV0 {
  id: string;
  type: EmovelActionTypeV0;
  label: string;
  sourceScreenId: string;
  target: string;
  requiresAuth: boolean;
  metadata: Record<string, string | boolean>;
}

export interface EmovelDataFieldV0 {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  required: boolean;
  description: string;
}

export interface EmovelDataEntityV0 {
  id: string;
  name: string;
  description: string;
  fields: EmovelDataFieldV0[];
}

export interface EmovelDataModelV0 {
  entities: EmovelDataEntityV0[];
  persistence: "none" | "local" | "supabase" | "external";
  notes: string;
}

export interface EmovelExportTargetConfigV0 {
  target: EmovelExportTargetV0;
  enabled: boolean;
  notes: string;
}

export interface EmovelQaChecklistItemV0 {
  id: string;
  label: string;
  status: "pending" | "passed" | "failed" | "blocked";
  severity: "low" | "medium" | "high";
  owner: "compiler" | "design" | "content" | "engineering";
}

export interface EmovelGeneratedAppSchemaV0 {
  schemaVersion: typeof EMOVEL_APP_SCHEMA_VERSION;
  project: EmovelProjectInfoV0;
  audience: EmovelAudienceV0;
  monetization: EmovelMonetizationV0;
  screens: EmovelScreenV0[];
  components: EmovelComponentInstanceV0[];
  theme: EmovelThemeV0;
  actions: EmovelActionV0[];
  dataModel: EmovelDataModelV0;
  exportTargets: EmovelExportTargetConfigV0[];
  qaChecklist: EmovelQaChecklistItemV0[];
}
