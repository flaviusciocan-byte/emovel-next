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

export async function handleTextExport(request: Request, format: Extract<ExportFormat, "markdown" | "txt">) {
  try {
    const { user, accessToken } = await requireAuth(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const payload = parseBody(await request.json());

    if (!payload.projectId) {
      return Response.json({ error: "Project is required for export." }, { status: 400 });
    }

    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return Response.json({ error: "Unable to load personal workspace." }, { status: 500 });
    }

    const project = await getProjectWithSections(context, workspace.id, payload.projectId);

    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    const brandProfile = await getBrandProfile(context, workspace.id);
    const normalized = normalizeExportSections(project.sections, project.fixed_section_order);
    const content =
      format === "markdown"
        ? assembleMarkdown(project, project.sections, brandProfile)
        : assembleTxt(project, project.sections, brandProfile);
    const fileExtension = format === "markdown" ? "md" : "txt";
    const fileName = `${slugify(project.name)}.${fileExtension}`;

    const exportRecord = await recordExport(context, workspace.id, {
      projectId: project.id,
      format,
      contentHash: contentHash(content),
    });

    return Response.json({
      content,
      fileName,
      format,
      contentType: format === "markdown" ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8",
      sectionCount: normalized.sections.length,
      acceptedSectionCount: project.sections.filter((section) => section.status === "accepted").length,
      readySectionCount: project.sections.filter((section) => section.status === "ready").length,
      warnings: normalized.warnings,
      usedReadyFallback: normalized.usedReadyFallback,
      exportId: exportRecord?.id || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    const status = message === "Authentication required." || message === "Invalid or expired session." ? 401 : 400;

    return Response.json({ error: message }, { status });
  }
}
