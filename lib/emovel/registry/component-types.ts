import type { EmovelComponentTypeV0 } from "../schema/app-schema.v0";

export interface EmovelComponentTypeDefinitionV0 {
  type: EmovelComponentTypeV0;
  label: string;
  purpose: string;
  allowedChildren: EmovelComponentTypeV0[];
  defaultStates: string[];
}

export const EMOVEL_COMPONENT_TYPE_DEFINITIONS: EmovelComponentTypeDefinitionV0[] = [
  {
    type: "hero",
    label: "Hero",
    purpose: "Open the product experience with clear positioning and primary action.",
    allowedChildren: ["checkout-cta", "form"],
    defaultStates: ["default"],
  },
  {
    type: "feature-grid",
    label: "Feature Grid",
    purpose: "Explain core capabilities or deliverables in a scannable layout.",
    allowedChildren: ["offer-card"],
    defaultStates: ["default"],
  },
  {
    type: "pricing-block",
    label: "Pricing Block",
    purpose: "Present offer tiers, price anchors, and checkout intent.",
    allowedChildren: ["checkout-cta"],
    defaultStates: ["default", "featured"],
  },
  {
    type: "form",
    label: "Form",
    purpose: "Capture leads, requests, or onboarding inputs.",
    allowedChildren: [],
    defaultStates: ["default", "submitting", "success", "error"],
  },
  {
    type: "faq",
    label: "FAQ",
    purpose: "Resolve buying friction and implementation objections.",
    allowedChildren: [],
    defaultStates: ["collapsed", "expanded"],
  },
];
