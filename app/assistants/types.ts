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

export type {
  MarketingBackgroundMode,
  MarketingImageModel,
  MarketingImageStatus,
  MarketingPlatformFormat,
  MarketingResult,
  MarketingStatus,
} from "../marketing-system/types";

export type SystemPhase =
  | "idle"
  | "orchestrating"
  | "executing"
  | "reviewing"
  | "complete"
  | "error";
