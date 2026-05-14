import type { EmovelComponentInstanceV0 } from "../schema/app-schema.v0";
import { EMOVEL_COMPONENT_TYPE_DEFINITIONS } from "./component-types";

export interface EmovelComponentRegistryEntryV0 {
  component: EmovelComponentInstanceV0;
  registryNotes: string;
}

export const EMOVEL_COMPONENT_REGISTRY_V0: EmovelComponentRegistryEntryV0[] = [
  {
    component: {
      id: "home-hero",
      type: "hero",
      screenId: "home",
      name: "Home Hero",
      purpose: "Introduce the app promise and move qualified users to the primary action.",
      props: {
        eyebrow: "EMOVEL App Factory",
        headline: "Generated product systems from a single brief.",
        ctaLabel: "Start",
      },
      dataBindings: [],
      states: ["default"],
    },
    registryNotes: "Foundation component for generated commercial app screens.",
  },
  {
    component: {
      id: "offer-pricing",
      type: "pricing-block",
      screenId: "home",
      name: "Offer Pricing",
      purpose: "Represent the monetization model without binding checkout logic yet.",
      props: {
        title: "Primary Offer",
        priceAnchor: "TBD",
      },
      dataBindings: ["monetization.offers"],
      states: ["default"],
    },
    registryNotes: "Checkout target stays abstract until integration is requested.",
  },
];

export function getComponentTypeDefinition(type: EmovelComponentInstanceV0["type"]) {
  return EMOVEL_COMPONENT_TYPE_DEFINITIONS.find((definition) => definition.type === type) ?? null;
}
