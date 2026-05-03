import type { CreditAction, CreditCost, ModelTier, ModelTierConfig } from "./types";

export const MODEL_TIERS: Record<ModelTier, ModelTierConfig> = {
  economy: {
    tier: "economy",
    label: "Economy",
    estimatedCreditCost: 4,
    useFor: "Cleanup, formatting, simple summaries, and tag generation.",
    futureProviderTarget: "cheap model",
  },
  standard: {
    tier: "standard",
    label: "Standard",
    estimatedCreditCost: 10,
    useFor: "Prompt generation, assistant drafts, and marketing captions.",
    futureProviderTarget: "mid model",
  },
  premium: {
    tier: "premium",
    label: "Premium",
    estimatedCreditCost: 12,
    useFor: "Strategy, product architecture, offer logic, and final copy.",
    futureProviderTarget: "GPT-5.5",
  },
  image: {
    tier: "image",
    label: "Image",
    estimatedCreditCost: 30,
    useFor: "Future professional visual generation.",
    futureProviderTarget: "image generation model",
  },
};

export const GENERATION_ROUTES: Record<CreditAction, CreditCost> = {
  "prompt-engine-generation": {
    action: "prompt-engine-generation",
    label: "Prompt Engine generation",
    cost: 10,
    modelTier: "standard",
    estimatedCreditCost: MODEL_TIERS.standard.estimatedCreditCost,
  },
  "assistants-orchestrator-generation": {
    action: "assistants-orchestrator-generation",
    label: "Assistants orchestration",
    cost: 12,
    modelTier: "premium",
    estimatedCreditCost: MODEL_TIERS.premium.estimatedCreditCost,
  },
  "marketing-social-pack-generation": {
    action: "marketing-social-pack-generation",
    label: "Marketing Social Pack generation",
    cost: 15,
    modelTier: "standard",
    estimatedCreditCost: 15,
  },
  "builder-generation": {
    action: "builder-generation",
    label: "Builder generation",
    cost: 12,
    modelTier: "premium",
    estimatedCreditCost: MODEL_TIERS.premium.estimatedCreditCost,
  },
};

export function routeGenerationTask(action: CreditAction): CreditCost {
  return GENERATION_ROUTES[action];
}
