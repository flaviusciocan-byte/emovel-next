export interface FiveStepStructure {
  objective: string;
  context: string;
  styleDirection: string;
  executionNotes: string;
  outputGoal: string;
}

export interface GeneratedPrompts {
  longPrompt: string;
  shortPrompt: string;
  visualPrompt1: string;
  visualPrompt2: string;
}

export interface VerificationCheck {
  pass: boolean;
  note: string;
}

export interface VerificationResult {
  coherence: VerificationCheck;
  clarity: VerificationCheck;
  commercialQuality: VerificationCheck;
  styleConsistency: VerificationCheck;
  contradictions: VerificationCheck;
  wordingOptimization: VerificationCheck;
}

export interface FinalPackage {
  structure: FiveStepStructure;
  prompts: GeneratedPrompts;
  verification: VerificationResult;
  clientChecklist: string[];
  recommendedAdjustments: string[];
}

export type EnginePhase =
  | "idle"
  | "structuring"
  | "generating"
  | "verifying"
  | "complete"
  | "error";
