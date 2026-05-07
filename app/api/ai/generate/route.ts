import { validateTemplateSpecV1, type TemplateSpecV1 } from "../../../builder/schema/v1";
import { captureServerEvent } from "../../../../lib/analytics/server-events";
import { POSTHOG_EVENTS } from "../../../../lib/analytics/posthog-events";
import { buildTemplateSpecPrompt } from "../../../../lib/ai/builder-prompt";
import { classifyBoundaryRequest } from "../../../../lib/ai/boundary";
import { getAvailableModelSequence, estimateCostCents } from "../../../../lib/ai/model-registry";
import { streamAiText } from "../../../../lib/ai/providers";
import { checkAiRateLimit } from "../../../../lib/ai/rate-limit";
import { estimateTokens, parseTemplateSpecFromText } from "../../../../lib/ai/spec-json";
import { requireAuth } from "../../../../lib/auth/session";
import {
  checkPlanLimit,
  getBrandProfile,
  getCurrentUsagePeriod,
  getOrCreateUserWorkspace,
  getProjectWithSections,
  getUsage,
  incrementUsageCounter,
  insertSection,
  recordAiGeneration,
  saveSectionDraft,
  updateProjectSectionOrder,
  updateSection,
  type ProjectWithSections,
} from "../../../../lib/emovel-ai/data-access";
import type { AiRequestCategory, SectionStatus } from "../../../../lib/emovel-ai/types";

interface GenerateRequest {
  brief?: string;
  projectId?: string;
  currentSpec?: unknown;
}

function jsonError(status: number, payload: Record<string, unknown>) {
  return Response.json(payload, { status });
}

function categorizedError(
  status: number,
  category: string,
  code: string,
  message: string | null | undefined,
  extra: Record<string, unknown> = {},
) {
  return jsonError(status, {
    category,
    code,
    error: message || category,
    ...extra,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseBody(value: unknown): GenerateRequest {
  return isRecord(value) ? value : {};
}

function validCurrentSpec(value: unknown) {
  return validateTemplateSpecV1(value).isValid ? (value as TemplateSpecV1) : null;
}

async function updateProjectSectionsStatus(input: {
  context: { userId: string; accessToken: string };
  workspaceId: string;
  project: Awaited<ReturnType<typeof getProjectWithSections>>;
  status: SectionStatus;
  errorMessage?: string | null;
}) {
  const section = getSnapshotSection(input.project);

  if (!section) {
    return;
  }

  await updateSection(input.context, input.workspaceId, section.id, {
    status: input.status,
    error_message: input.errorMessage || null,
  });
}

function getSnapshotSection(project: ProjectWithSections | null) {
  if (!project) {
    return null;
  }

  return (
    project.sections.find((section) => section.section_key === "hero") ||
    project.sections.find((section) => section.position === 0) ||
    project.sections[0] ||
    null
  );
}

function normalizeSectionId(base: string, usedIds: Set<string>) {
  const normalizedBase =
    base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  let candidate = normalizedBase;
  let index = 2;

  while (usedIds.has(candidate)) {
    candidate = `${normalizedBase}-${index}`;
    index += 1;
  }

  usedIds.add(candidate);
  return candidate;
}

function normalizeGeneratedSpecForProject(spec: TemplateSpecV1, project: ProjectWithSections) {
  const fixedOrder = project.fixed_section_order || [];
  const existingKeys = new Set(project.sections.map((section) => section.section_key));
  const usedIds = new Set<string>();

  return {
    ...spec,
    sections: spec.sections.map((section, index) => {
      const stableId = existingKeys.has(section.id)
        ? section.id
        : fixedOrder[index] || normalizeSectionId(section.type || section.id, usedIds);

      usedIds.add(stableId);

      return {
        ...section,
        id: stableId,
      };
    }),
  };
}

async function persistSpecSections(input: {
  context: { userId: string; accessToken: string };
  workspaceId: string;
  projectId: string;
  sections: ProjectWithSections["sections"];
  spec: TemplateSpecV1;
}) {
  await updateProjectSectionOrder(
    input.context,
    input.workspaceId,
    input.projectId,
    input.spec.sections.map((section) => section.id),
  );

  const persistedSections = [...input.sections];
  let nextInsertPosition =
    persistedSections.reduce((highest, section) => Math.max(highest, section.position), -1) + 1;

  for (const [index, section] of input.spec.sections.entries()) {
    const existing = persistedSections.find((item) => item.section_key === section.id);
    const content = {
      templateSpecSection: section,
      specSnapshot: index === 0 ? input.spec : undefined,
    };

    if (existing) {
      await updateSection(input.context, input.workspaceId, existing.id, {
        title: section.title,
        content,
        status: "ready",
        error_message: null,
      });
      await saveSectionDraft(input.context, input.workspaceId, {
        projectId: input.projectId,
        sectionId: existing.id,
        sectionKey: existing.section_key,
        draftContent: content,
        source: "ai",
      });
      continue;
    }

    const inserted = await insertSection(input.context, input.workspaceId, {
      projectId: input.projectId,
      sectionKey: section.id,
      position: nextInsertPosition,
      title: section.title,
      content,
      status: "ready",
      errorMessage: null,
    });
    nextInsertPosition += 1;

    if (inserted) {
      await saveSectionDraft(input.context, input.workspaceId, {
        projectId: input.projectId,
        sectionId: inserted.id,
        sectionKey: inserted.section_key,
        draftContent: content,
        source: "ai",
      });
    }
  }
}

function streamEvent(controller: ReadableStreamDefaultController<Uint8Array>, value: unknown) {
  controller.enqueue(new TextEncoder().encode(`${JSON.stringify(value)}\n`));
}

export async function POST(request: Request) {
  let userId = "anonymous";

  try {
    const { user, accessToken } = await requireAuth(request);
    userId = user.id;
    const context = {
      userId: user.id,
      accessToken,
    };
    const payload = parseBody(await request.json());
    const brief = payload.brief?.trim() || "";

    if (!brief) {
      return categorizedError(400, "generation_failed", "MISSING_BRIEF", "Page brief is required.");
    }

    if (!payload.projectId) {
      return categorizedError(400, "generation_failed", "MISSING_PROJECT", "Project is required before generation.");
    }

    void captureServerEvent(user.id, POSTHOG_EVENTS.aiGenerateRequested);

    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return categorizedError(500, "internal_error", "WORKSPACE_UNAVAILABLE", "Unable to load workspace.");
    }

    const project = await getProjectWithSections(context, workspace.id, payload.projectId);

    if (!project) {
      return categorizedError(403, "forbidden", "PROJECT_NOT_FOUND", "Project not found or not available.");
    }
    const snapshotSection = getSnapshotSection(project);

    const rateLimit = checkAiRateLimit(`${user.id}:${workspace.id}`);

    if (!rateLimit.allowed) {
      await updateProjectSectionsStatus({
        context,
        workspaceId: workspace.id,
        project,
        status: "error_rate_limited",
        errorMessage: "Rate limit reached. Try again shortly.",
      });
      void captureServerEvent(user.id, POSTHOG_EVENTS.aiGenerateFailed, { reason: "rate_limited" });

      return categorizedError(429, "rate_limited", "RATE_LIMITED", "Rate limit reached. Try again shortly.", {
        resetAt: rateLimit.resetAt,
      });
    }

    const boundary = classifyBoundaryRequest(brief);

    if (!boundary.allowed) {
      await updateProjectSectionsStatus({
        context,
        workspaceId: workspace.id,
        project,
        status: boundary.category === "ambiguous" ? "error_retryable" : "error_blocked",
        errorMessage: boundary.requiredClarification || boundary.reason,
      });
      await recordAiGeneration(context, workspace.id, {
        projectId: project.id,
        sectionId: snapshotSection?.id || null,
        requestCategory: boundary.category,
        provider: "none",
        modelKey: "boundary",
        status: "blocked",
        errorMessage: boundary.requiredClarification || boundary.reason,
      });
      void captureServerEvent(user.id, POSTHOG_EVENTS.aiGenerateBlocked, {
        category: boundary.category,
      });

      return categorizedError(
        boundary.category === "ambiguous" ? 422 : 403,
        "boundary_blocked",
        boundary.category === "ambiguous" ? "NEEDS_CLARIFICATION" : "BLOCKED_REQUEST",
        boundary.requiredClarification || boundary.reason,
        {
        boundary,
        },
      );
    }

    const { periodStart, periodEnd } = getCurrentUsagePeriod();
    const usage = await getUsage(context, workspace.id, periodStart, periodEnd);
    const planGate = await checkPlanLimit(context, workspace.id, "generate_ai", usage);

    if (!planGate.allowed) {
      await updateProjectSectionsStatus({
        context,
        workspaceId: workspace.id,
        project,
        status: "error_billing",
        errorMessage: planGate.reason,
      });
      await recordAiGeneration(context, workspace.id, {
        projectId: project.id,
        sectionId: snapshotSection?.id || null,
        requestCategory: boundary.category,
        provider: "none",
        modelKey: "billing_gate",
        status: "failed",
        errorMessage: planGate.reason,
      });
      void captureServerEvent(user.id, POSTHOG_EVENTS.billingGateHit, { action: "generate_ai" });

      return categorizedError(402, "billing_gate", "BILLING_GATE", planGate.reason);
    }

    const modelSequence = getAvailableModelSequence();

    if (modelSequence.length === 0) {
      await recordAiGeneration(context, workspace.id, {
        projectId: project.id,
        sectionId: snapshotSection?.id || null,
        requestCategory: boundary.category,
        provider: "none",
        modelKey: "not_configured",
        status: "failed",
        errorMessage: "No configured AI provider is available.",
      });

      return categorizedError(
        503,
        "provider_not_configured",
        "AI_NOT_CONFIGURED",
        "No configured AI provider is available. Builder can use local fallback.",
        {
          allowLocalFallback: process.env.NODE_ENV !== "production",
        },
      );
    }

    await updateProjectSectionsStatus({
      context,
      workspaceId: workspace.id,
      project,
      status: "generating",
    });

    const brandProfile = await getBrandProfile(context, workspace.id);
    const currentSpec = validCurrentSpec(payload.currentSpec);
    const prompt = buildTemplateSpecPrompt({
      brief,
      boundary,
      brandProfile,
      project,
      currentSpec,
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let fullText = "";
        let selectedModel = modelSequence[0];
        let emitted = false;
        let promptTokens = estimateTokens(`${prompt.system}\n${prompt.user}`);
        let completionTokens = 0;

        try {
          streamEvent(controller, { type: "status", status: "generating", boundary });

          for (const modelConfig of modelSequence) {
            selectedModel = modelConfig;
            const streamResult = streamAiText(modelConfig, [
              { role: "system", content: prompt.system },
              { role: "user", content: prompt.user },
            ]);

            try {
              void captureServerEvent(user.id, POSTHOG_EVENTS.aiGenerateStreamStarted, {
                provider: modelConfig.provider,
              });

              for await (const part of streamResult.text) {
                if (!emitted) {
                  await updateProjectSectionsStatus({
                    context,
                    workspaceId: workspace.id,
                    project,
                    status: "streaming_partial",
                  });
                }

                emitted = true;
                fullText += part;
                streamEvent(controller, { type: "partial", content: part });
              }

              promptTokens = streamResult.usage.promptTokens || promptTokens;
              completionTokens = streamResult.usage.completionTokens || estimateTokens(fullText);
              break;
            } catch (error) {
              if (emitted || modelConfig === modelSequence[modelSequence.length - 1]) {
                throw error;
              }
            }
          }

          const generatedSpec = normalizeGeneratedSpecForProject(
            parseTemplateSpecFromText(fullText),
            project,
          );
          const estimatedCostCents = estimateCostCents(selectedModel, promptTokens, completionTokens);

          await persistSpecSections({
            context,
            workspaceId: workspace.id,
            projectId: project.id,
            sections: project.sections,
            spec: generatedSpec,
          });
          await recordAiGeneration(context, workspace.id, {
            projectId: project.id,
            sectionId: snapshotSection?.id || null,
            requestCategory: boundary.category as AiRequestCategory,
            provider: selectedModel.provider,
            modelKey: selectedModel.model,
            promptTokens,
            completionTokens,
            estimatedCostCents,
            status: "completed",
          });
          await incrementUsageCounter(context, workspace.id, {
            aiGenerations: 1,
            sectionsGenerated: generatedSpec.sections.length,
            tokensUsed: promptTokens + completionTokens,
            estimatedCostCents,
          });
          void captureServerEvent(user.id, POSTHOG_EVENTS.aiGenerateCompleted, {
            provider: selectedModel.provider,
            sections: generatedSpec.sections.length,
          });

          streamEvent(controller, {
            type: "spec",
            spec: generatedSpec,
            usage: {
              promptTokens,
              completionTokens,
              estimatedCostCents,
              provider: selectedModel.provider,
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI generation failed.";
          await updateProjectSectionsStatus({
            context,
            workspaceId: workspace.id,
            project,
            status: "error_retryable",
            errorMessage: message,
          });
          await recordAiGeneration(context, workspace.id, {
            projectId: project.id,
            sectionId: snapshotSection?.id || null,
            requestCategory: boundary.category,
            provider: selectedModel?.provider || "none",
            modelKey: selectedModel?.model || "unknown",
            promptTokens,
            completionTokens,
            status: "failed",
            errorMessage: message,
          });
          void captureServerEvent(user.id, POSTHOG_EVENTS.aiGenerateFailed, {
            reason: message,
          });
          streamEvent(controller, {
            type: "error",
            category: "generation_failed",
            code: "AI_GENERATION_FAILED",
            error: message,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    void captureServerEvent(userId, POSTHOG_EVENTS.aiGenerateFailed, { reason: "route_error" });

    const message = error instanceof Error ? error.message : "Unexpected AI route failure.";

    if (message === "Authentication required." || message === "Invalid or expired session.") {
      return categorizedError(401, "unauthorized", "AUTH_REQUIRED", message);
    }

    return categorizedError(500, "internal_error", "INTERNAL_ERROR", message);
  }
}
