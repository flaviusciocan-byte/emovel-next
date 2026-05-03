export type AssistantId =
  | "core"
  | "orchestrator"
  | "marketing"
  | "maintenance"
  | "commerce";

export interface AssistantMeta {
  id: AssistantId;
  name: string;
  role: string;
  functions: string[];
  color: string;
}

export interface OrchestratorPlan {
  taskSummary: string;
  assignments: {
    assistant: AssistantId;
    task: string;
    order: number;
  }[];
}

export interface AssistantResponse {
  assistantId: AssistantId;
  assistantName: string;
  task: string;
  output: string;
}

export interface FinalPackage {
  plan: OrchestratorPlan;
  responses: AssistantResponse[];
  qualityCheck: string;
  timestamp: string;
}

export type MarketingStatus = "draft" | "approved" | "scheduled" | "published" | "failed";

export type MarketingImageStatus = "draft" | "ready" | "generated" | "failed";

export type MarketingBackgroundMode =
  | "cinematic-dark"
  | "luxury-gradient"
  | "product-studio"
  | "clean-white"
  | "transparent-style";

export type MarketingPlatformFormat =
  | "Instagram/Facebook Post"
  | "Story/Reel Cover"
  | "Square Product Ad";

export interface MarketingResult {
  campaignTitle: string;
  platform: string;
  visualVariantA: string;
  visualVariantB: string;
  caption: string;
  hashtags: string[];
  cta: string;
  format: string;
  status: MarketingStatus;
}

export interface MarketingImageModel {
  visualPrompt: string;
  platformFormat: MarketingPlatformFormat;
  backgroundMode: MarketingBackgroundMode;
  stylePreset: string;
  size: string;
  status: MarketingImageStatus;
  imageUrl?: string;
}

export type SystemPhase =
  | "idle"
  | "orchestrating"
  | "executing"
  | "reviewing"
  | "complete"
  | "error";
