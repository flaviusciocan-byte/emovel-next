import { getPlanLimits } from "../billing/plan-limits";
import { createServerSupabaseClient } from "../supabase/server";
import { eq } from "../supabase/rest-client";
import { V1_FIXED_SECTION_ORDER } from "./section-order";
import type {
  AiGeneration,
  AiGenerationStatus,
  AiRequestCategory,
  BrandProfile,
  BrandProfileInput,
  OnboardingStep,
  PlanLimits,
  Profile,
  Project,
  ProjectInput,
  SectionDraft,
  SectionDraftSource,
  SectionInput,
  SectionRecord,
  UsageCounter,
  Workspace,
} from "./types";

export interface UserDataContext {
  userId: string;
  accessToken: string;
}

export interface ProjectWithSections extends Project {
  sections: SectionRecord[];
}

export type PlanLimitAction = "create_project" | "generate_ai" | "export_pdf";

function clientFor(context: UserDataContext) {
  return createServerSupabaseClient(context.accessToken);
}

function firstOrNull<T>(rows: T[]) {
  return rows[0] || null;
}

export async function getCurrentProfile(context: UserDataContext) {
  const client = clientFor(context);
  const rows = await client.select<Profile>("profiles", {
    query: {
      id: eq(context.userId),
      limit: 1,
    },
  });

  return firstOrNull(rows);
}

export async function getUserWorkspace(context: UserDataContext) {
  const client = clientFor(context);
  const rows = await client.select<Workspace>("workspaces", {
    query: {
      user_id: eq(context.userId),
      kind: eq("personal"),
      limit: 1,
    },
  });

  return firstOrNull(rows);
}

export async function getOrCreateUserWorkspace(context: UserDataContext) {
  const existingWorkspace = await getUserWorkspace(context);

  if (existingWorkspace) {
    return existingWorkspace;
  }

  const client = clientFor(context);
  const rows = await client.upsert<Workspace>(
    "workspaces",
    {
      user_id: context.userId,
      name: "Personal Workspace",
      kind: "personal",
      updated_at: new Date().toISOString(),
    },
    "user_id,kind",
  );

  return firstOrNull(rows);
}

export async function getBrandProfile(context: UserDataContext, workspaceId: string) {
  const client = clientFor(context);
  const rows = await client.select<BrandProfile>("brand_profiles", {
    query: {
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
      limit: 1,
    },
  });

  return firstOrNull(rows);
}

export async function getOrCreateBrandProfile(
  context: UserDataContext,
  workspaceId: string,
  input: Partial<BrandProfileInput> = {},
) {
  const existingProfile = await getBrandProfile(context, workspaceId);

  if (existingProfile) {
    return existingProfile;
  }

  return updateBrandProfile(context, workspaceId, {
    brand_name: input.brand_name?.trim() || "Untitled Brand",
    audience: input.audience || null,
    tone: input.tone || null,
    visual_direction: input.visual_direction || null,
    offer_positioning: input.offer_positioning || null,
  });
}

export async function updateBrandProfile(
  context: UserDataContext,
  workspaceId: string,
  input: BrandProfileInput,
) {
  const client = clientFor(context);
  const payload = {
    ...input,
    user_id: context.userId,
    workspace_id: workspaceId,
    updated_at: new Date().toISOString(),
  };

  const rows = await client.upsert<BrandProfile>("brand_profiles", payload, "user_id,workspace_id");

  return firstOrNull(rows);
}

export async function getOnboardingStep(context: UserDataContext) {
  const profile = await getCurrentProfile(context);

  return profile?.onboarding_step || null;
}

export async function updateOnboardingStep(
  context: UserDataContext,
  onboardingStep: OnboardingStep,
) {
  const client = clientFor(context);
  const rows = await client.update<Profile>(
    "profiles",
    {
      id: eq(context.userId),
    },
    {
      onboarding_step: onboardingStep,
      updated_at: new Date().toISOString(),
    },
  );

  return firstOrNull(rows);
}

export async function getProjects(context: UserDataContext, workspaceId: string) {
  const client = clientFor(context);

  return client.select<Project>("projects", {
    query: {
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
      order: "created_at.desc",
    },
  });
}

export async function createProject(
  context: UserDataContext,
  workspaceId: string,
  input: ProjectInput,
) {
  const client = clientFor(context);
  const fixedSectionOrder = input.fixed_section_order || [...V1_FIXED_SECTION_ORDER];
  const projectRows = await client.insert<Project>("projects", {
    user_id: context.userId,
    workspace_id: workspaceId,
    brand_profile_id: input.brand_profile_id || null,
    name: input.name,
    product_type: input.product_type || null,
    commercial_goal: input.commercial_goal || null,
    fixed_section_order: fixedSectionOrder,
  });
  const project = firstOrNull(projectRows);

  if (!project) {
    return null;
  }

  await client.insert<SectionRecord>(
    "sections",
    fixedSectionOrder.map((sectionKey, index) => ({
      user_id: context.userId,
      workspace_id: workspaceId,
      project_id: project.id,
      section_key: sectionKey,
      position: index,
      status: "empty",
      content: {},
    })),
  );

  return getProjectWithSections(context, workspaceId, project.id);
}

export async function getProjectWithSections(
  context: UserDataContext,
  workspaceId: string,
  projectId: string,
): Promise<ProjectWithSections | null> {
  const client = clientFor(context);
  const projectRows = await client.select<Project>("projects", {
    query: {
      id: eq(projectId),
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
      limit: 1,
    },
  });
  const project = firstOrNull(projectRows);

  if (!project) {
    return null;
  }

  const sections = await client.select<SectionRecord>("sections", {
    query: {
      project_id: eq(projectId),
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
      order: "position.asc",
    },
  });

  return {
    ...project,
    sections,
  };
}

export async function updateProjectSectionOrder(
  context: UserDataContext,
  workspaceId: string,
  projectId: string,
  fixedSectionOrder: string[],
) {
  const client = clientFor(context);
  const rows = await client.update<Project>(
    "projects",
    {
      id: eq(projectId),
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
    },
    {
      fixed_section_order: fixedSectionOrder,
      updated_at: new Date().toISOString(),
    },
  );

  return firstOrNull(rows);
}

export async function insertSection(
  context: UserDataContext,
  workspaceId: string,
  input: {
    projectId: string;
    sectionKey: string;
    position: number;
    title?: string | null;
    content?: Record<string, unknown>;
    status?: SectionRecord["status"];
    errorMessage?: string | null;
  },
) {
  const client = clientFor(context);
  const rows = await client.insert<SectionRecord>("sections", {
    user_id: context.userId,
    workspace_id: workspaceId,
    project_id: input.projectId,
    section_key: input.sectionKey,
    position: input.position,
    title: input.title || null,
    content: input.content || {},
    status: input.status || "empty",
    error_message: input.errorMessage || null,
  });

  return firstOrNull(rows);
}

export async function updateSection(
  context: UserDataContext,
  workspaceId: string,
  sectionId: string,
  input: SectionInput,
) {
  const client = clientFor(context);
  const rows = await client.update<SectionRecord>(
    "sections",
    {
      id: eq(sectionId),
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
    },
    {
      ...input,
      updated_at: new Date().toISOString(),
    },
  );

  return firstOrNull(rows);
}

export async function acceptSection(
  context: UserDataContext,
  workspaceId: string,
  sectionId: string,
) {
  return updateSection(context, workspaceId, sectionId, {
    status: "accepted",
    error_message: null,
  });
}

export async function saveSectionDraft(
  context: UserDataContext,
  workspaceId: string,
  input: {
    projectId: string;
    sectionId?: string | null;
    sectionKey: string;
    draftContent: Record<string, unknown>;
    source: SectionDraftSource;
  },
) {
  const client = clientFor(context);
  const rows = await client.insert<SectionDraft>("section_drafts", {
    user_id: context.userId,
    workspace_id: workspaceId,
    project_id: input.projectId,
    section_id: input.sectionId || null,
    section_key: input.sectionKey,
    draft_content: input.draftContent,
    source: input.source,
  });

  return firstOrNull(rows);
}

export async function getUsage(
  context: UserDataContext,
  workspaceId: string,
  periodStart: string,
  periodEnd: string,
) {
  const client = clientFor(context);
  const rows = await client.select<UsageCounter>("usage_counters", {
    query: {
      user_id: eq(context.userId),
      workspace_id: eq(workspaceId),
      period_start: eq(periodStart),
      period_end: eq(periodEnd),
      limit: 1,
    },
  });

  return firstOrNull(rows);
}

export function getCurrentUsagePeriod(now = new Date()) {
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
  };
}

export async function recordAiGeneration(
  context: UserDataContext,
  workspaceId: string,
  input: {
    projectId?: string | null;
    sectionId?: string | null;
    requestCategory: AiRequestCategory;
    provider: string;
    modelKey: string;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCostCents?: number;
    status: AiGenerationStatus;
    errorMessage?: string | null;
  },
) {
  const client = clientFor(context);
  const rows = await client.insert<AiGeneration>("ai_generations", {
    user_id: context.userId,
    workspace_id: workspaceId,
    project_id: input.projectId || null,
    section_id: input.sectionId || null,
    request_category: input.requestCategory,
    provider: input.provider,
    model_key: input.modelKey,
    prompt_tokens: input.promptTokens || 0,
    completion_tokens: input.completionTokens || 0,
    estimated_cost_cents: input.estimatedCostCents || 0,
    status: input.status,
    error_message: input.errorMessage || null,
  });

  return firstOrNull(rows);
}

export async function incrementUsageCounter(
  context: UserDataContext,
  workspaceId: string,
  input: {
    aiGenerations?: number;
    sectionsGenerated?: number;
    tokensUsed?: number;
    estimatedCostCents?: number;
  },
) {
  const client = clientFor(context);
  const { periodStart, periodEnd } = getCurrentUsagePeriod();
  const row = await client.request<UsageCounter>("/rest/v1/rpc/increment_usage_counter", {
    method: "POST",
    body: JSON.stringify({
      target_workspace_id: workspaceId,
      target_period_start: periodStart,
      target_period_end: periodEnd,
      ai_generations_delta: input.aiGenerations || 0,
      sections_generated_delta: input.sectionsGenerated || 0,
      tokens_used_delta: input.tokensUsed || 0,
      estimated_cost_cents_delta: input.estimatedCostCents || 0,
    }),
  });

  return row;
}

export async function checkPlanLimit(
  context: UserDataContext,
  workspaceId: string,
  action: PlanLimitAction,
  usage?: UsageCounter | null,
): Promise<{
  allowed: boolean;
  reason: string | null;
  profile: Profile | null;
  limits: PlanLimits;
  projectCount: number;
}> {
  const [profile, projects] = await Promise.all([
    getCurrentProfile(context),
    getProjects(context, workspaceId),
  ]);
  const limits = getPlanLimits(profile?.plan || "free");
  let allowed = true;
  let reason: string | null = null;

  if (action === "create_project" && limits.maxProjects !== null && projects.length >= limits.maxProjects) {
    allowed = false;
    reason = "Project limit reached for current plan.";
  }

  if (
    action === "generate_ai" &&
    limits.monthlyAiGenerations !== null &&
    (usage?.ai_generations_count || 0) >= limits.monthlyAiGenerations
  ) {
    allowed = false;
    reason = "Monthly AI generation limit reached for current plan.";
  }

  if (action === "export_pdf" && !limits.canExportPdf) {
    allowed = false;
    reason = "PDF export requires Pro.";
  }

  return {
    allowed,
    reason,
    profile,
    limits,
    projectCount: projects.length,
  };
}
