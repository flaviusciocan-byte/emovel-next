import { createHash } from "node:crypto";

import { requireAuth } from "../auth/session";
import {
  getBrandProfile,
  getOrCreateUserWorkspace,
  getProjectWithSections,
  recordExport,
} from "../emovel-ai/data-access";
import type { ExportFormat } from "../emovel-ai/types";
import { assembleMarkdown, assembleTxt, normalizeExportSections } from "./assembly";

interface ExportRequestBody {
  projectId?: string;
}

type ExportErrorCategory =
  | "unauthorized"
  | "invalid_request"
  | "not_found"
  | "export_failed"
  | "record_export_failed"
  | "internal_error";

interface ExportErrorInput {
  status: number;
  category: ExportErrorCategory;
  code: string;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseBody(value: unknown): ExportRequestBody {
  return isRecord(value) ? value : {};
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "emovel-export"
  );
}

function contentHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function exportError(input: ExportErrorInput) {
  return Response.json(
    {
      error: input.message,
      code: input.code,
      category: input.category,
    },
    { status: input.status },
  );
}

async function readPayload(request: Request) {
  try {
    return parseBody(await request.json());
  } catch {
    return null;
  }
}

function mapExportError(error: unknown) {
  const message = error instanceof Error ? error.message : "Export failed.";

  if (message === "Authentication required." || message === "Invalid or expired session.") {
    return exportError({
      status: 401,
      category: "unauthorized",
      code: "AUTH_REQUIRED",
      message,
    });
  }

  return exportError({
    status: 500,
    category: "export_failed",
    code: "EXPORT_FAILED",
    message: "Export failed.",
  });
}

export async function handleTextExport(request: Request, format: Extract<ExportFormat, "markdown" | "txt">) {
  try {
    const { user, accessToken } = await requireAuth(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const payload = await readPayload(request);

    if (!payload) {
      return exportError({
        status: 400,
        category: "invalid_request",
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      });
    }

    if (!payload.projectId) {
      return exportError({
        status: 400,
        category: "invalid_request",
        code: "PROJECT_REQUIRED",
        message: "Project is required for export.",
      });
    }

    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return exportError({
        status: 500,
        category: "internal_error",
        code: "WORKSPACE_UNAVAILABLE",
        message: "Unable to load personal workspace.",
      });
    }

    const project = await getProjectWithSections(context, workspace.id, payload.projectId);

    if (!project) {
      return exportError({
        status: 404,
        category: "not_found",
        code: "PROJECT_NOT_FOUND",
        message: "Project not found.",
      });
    }

    const brandProfile = await getBrandProfile(context, workspace.id);
    const normalized = normalizeExportSections(project.sections, project.fixed_section_order);
    const content =
      format === "markdown"
        ? assembleMarkdown(project, project.sections, brandProfile)
        : assembleTxt(project, project.sections, brandProfile);
    const fileExtension = format === "markdown" ? "md" : "txt";
    const fileName = `${slugify(project.name)}.${fileExtension}`;

    let exportId: string | null = null;
    let warnings = normalized.warnings;

    try {
      const exportRecord = await recordExport(context, workspace.id, {
        projectId: project.id,
        format,
        contentHash: contentHash(content),
      });
      exportId = exportRecord?.id || null;
    } catch (error) {
      console.warn("EMOVEL export history record failed.", {
        category: "record_export_failed",
        format,
        projectId: project.id,
        message: error instanceof Error ? error.message : "Unknown recordExport failure.",
      });
      warnings = [
        ...warnings,
        "Export history could not be recorded. File content was still generated.",
      ];
    }

    return Response.json({
      content,
      fileName,
      format,
      contentType: format === "markdown" ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8",
      sectionCount: normalized.sections.length,
      acceptedSectionCount: project.sections.filter((section) => section.status === "accepted").length,
      readySectionCount: project.sections.filter((section) => section.status === "ready").length,
      warnings,
      usedReadyFallback: normalized.usedReadyFallback,
      exportId,
    });
  } catch (error) {
    return mapExportError(error);
  }
}
