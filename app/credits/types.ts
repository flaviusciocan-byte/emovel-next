export type CreditAction =
  | "prompt-engine-generation"
  | "assistants-orchestrator-generation"
  | "marketing-social-pack-generation"
  | "builder-generation";

export type ModelTier = "economy" | "standard" | "premium" | "image";

export interface UserCreditBalance {
  balance: number;
  currency: "credits";
}

export interface CreditCost {
  action: CreditAction;
  label: string;
  cost: number;
  modelTier: ModelTier;
  estimatedCreditCost: number;
}

export interface ModelTierConfig {
  tier: ModelTier;
  label: string;
  estimatedCreditCost: number;
  useFor: string;
  futureProviderTarget: string;
}
