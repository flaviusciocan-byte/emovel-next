export type UserPlan = "free" | "pro";

export type WorkspaceKind = "personal";

export type OnboardingStep =
  | "brand_profile"
  | "first_project"
  | "complete";

export type ProjectStatus = "draft" | "active" | "archived";

export type SectionStatus =
  | "empty"
  | "generating"
  | "streaming_partial"
  | "ready"
  | "accepted"
  | "error"
  | "error_retryable"
  | "error_blocked"
  | "error_billing"
  | "error_rate_limited";

export type SectionDraftSource = "ai" | "manual" | "regenerate";

export type ProjectMemoryType = "basic" | "advanced";

export type AiRequestCategory =
  | "production"
  | "commercial_ui"
  | "monetization"
  | "brand"
  | "client_deliverable"
  | "ambiguous"
  | "general_knowledge"
  | "entertainment"
  | "news"
  | "medical_legal_financial_advice"
  | "unrelated_coding_assistant_behavior"
  | "trivia_history_science";

export type AiGenerationStatus = "streaming" | "completed" | "failed" | "blocked";

export type ExportFormat = "markdown" | "txt" | "pdf";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: UserPlan;
  onboarding_step: OnboardingStep;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  kind: WorkspaceKind;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  workspace_id: string;
  brand_name: string;
  audience: string | null;
  tone: string | null;
  visual_direction: string | null;
  offer_positioning: string | null;
  created_at: string;
  updated_at: string;
}

export type BrandProfileInput = Pick<
  BrandProfile,
  "brand_name" | "audience" | "tone" | "visual_direction" | "offer_positioning"
>;

export interface Project {
  id: string;
  user_id: string;
  workspace_id: string;
  brand_profile_id: string | null;
  name: string;
  product_type: string | null;
  commercial_goal: string | null;
  fixed_section_order: string[];
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  name: string;
  brand_profile_id?: string | null;
  product_type?: string | null;
  commercial_goal?: string | null;
  fixed_section_order?: string[];
}

export interface SectionRecord {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id: string;
  section_key: string;
  position: number;
  title: string | null;
  content: Record<string, unknown>;
  status: SectionStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SectionInput {
  title?: string | null;
  content?: Record<string, unknown>;
  status?: SectionStatus;
  error_message?: string | null;
}

export interface SectionDraft {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id: string;
  section_id: string | null;
  section_key: string;
  draft_content: Record<string, unknown>;
  source: SectionDraftSource;
  created_at: string;
}

export interface UsageCounter {
  id: string;
  user_id: string;
  workspace_id: string;
  period_start: string;
  period_end: string;
  ai_generations_count: number;
  sections_generated_count: number;
  exports_count: number;
  tokens_used: number;
  estimated_cost_cents: number;
  created_at: string;
  updated_at: string;
}

export interface AiGeneration {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id: string | null;
  section_id: string | null;
  request_category: AiRequestCategory;
  provider: string;
  model_key: string;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_cents: number;
  status: AiGenerationStatus;
  error_message: string | null;
  created_at: string;
}

export interface ExportRecord {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id: string;
  format: ExportFormat;
  storage_path: string | null;
  content_hash: string | null;
  created_at: string;
}

export interface PdfExportRecord {
  id: string;
  user_id: string;
  workspace_id: string;
  project_id: string;
  storage_path: string;
  signed_url_expires_at: string | null;
  created_at: string;
}

export interface PlanLimits {
  plan: UserPlan;
  maxProjects: number | null;
  monthlyAiGenerations: number | null;
  canCopySections: boolean;
  canExportPdf: boolean;
  memory: {
    basic: boolean;
    advanced: boolean;
  };
}
