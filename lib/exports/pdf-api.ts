import { createHash, randomUUID } from "node:crypto";

import { requireAuth } from "../auth/session";
import {
  checkPlanLimit,
  getBrandProfile,
  getOrCreateUserWorkspace,
  getProjectWithSections,
  recordExport,
  recordPdfExport,
} from "../emovel-ai/data-access";
import { normalizeExportSections } from "./assembly";
import { generateProjectPdf } from "./pdf";
import { createPrivatePdfSignedUrl, uploadPrivatePdf } from "./pdf-storage";

const SIGNED_URL_TTL_SECONDS = 15 * 60;

type PdfExportErrorCategory =
  | "unauthorized"
  | "invalid_request"
  | "not_found"
  | "billing_gate"
  | "pdf_generation_failed"
  | "storage_failed"
  | "signed_url_failed"
  | "internal_error";

interface PdfExportRequestBody {
  projectId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseBody(value: unknown): PdfExportRequestBody {
  return isRecord(value) ? value : {};
}

async function readPayload(request: Request) {
  try {
    return parseBody(await request.json());
  } catch {
    return null;
  }
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

function contentHash(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function pdfExportError(input: {
  status: number;
  category: PdfExportErrorCategory;
  code: string;
  message: string;
}) {
  return Response.json(
    {
      error: input.message,
      code: input.code,
      category: input.category,
    },
    { status: input.status },
  );
}

function mapPdfExportError(error: unknown) {
  const message = error instanceof Error ? error.message : "PDF export failed.";

  if (message === "Authentication required." || message === "Invalid or expired session.") {
    return pdfExportError({
      status: 401,
      category: "unauthorized",
      code: "AUTH_REQUIRED",
      message,
    });
  }

  console.error("EMOVEL PDF export failed.", {
    category: "internal_error",
    message,
  });

  return pdfExportError({
    status: 500,
    category: "internal_error",
    code: "PDF_EXPORT_FAILED",
    message: "PDF export failed.",
  });
}

export async function handlePdfExport(request: Request) {
  try {
    const { user, accessToken } = await requireAuth(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const payload = await readPayload(request);

    if (!payload) {
      return pdfExportError({
        status: 400,
        category: "invalid_request",
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      });
    }

    if (!payload.projectId) {
      return pdfExportError({
        status: 400,
        category: "invalid_request",
        code: "PROJECT_REQUIRED",
        message: "Project is required for PDF export.",
      });
    }

    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return pdfExportError({
        status: 500,
        category: "internal_error",
        code: "WORKSPACE_UNAVAILABLE",
        message: "Unable to load personal workspace.",
      });
    }

    const project = await getProjectWithSections(context, workspace.id, payload.projectId);

    if (!project) {
      return pdfExportError({
        status: 404,
        category: "not_found",
        code: "PROJECT_NOT_FOUND",
        message: "Project not found.",
      });
    }

    const planGate = await checkPlanLimit(context, workspace.id, "export_pdf");

    if (!planGate.allowed) {
      return pdfExportError({
        status: 403,
        category: "billing_gate",
        code: "PDF_EXPORT_REQUIRES_PRO",
        message: "PDF export requires Pro.",
      });
    }

    const brandProfile = await getBrandProfile(context, workspace.id);
    const normalized = normalizeExportSections(project.sections, project.fixed_section_order);
    let pdf: Buffer;

    try {
      pdf = await generateProjectPdf({
        project,
        sections: project.sections,
        brandProfile,
      });
    } catch (error) {
      console.error("EMOVEL PDF generation failed.", {
        category: "pdf_generation_failed",
        projectId: project.id,
        message: error instanceof Error ? error.message : "Unknown PDF generation failure.",
      });

      return pdfExportError({
        status: 500,
        category: "pdf_generation_failed",
        code: "PDF_GENERATION_FAILED",
        message: "PDF generation failed.",
      });
    }

    const pdfExportId = randomUUID();
    const storagePath = `${user.id}/${project.id}/${pdfExportId}.pdf`;
    const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString();

    try {
      await uploadPrivatePdf({
        storagePath,
        pdf,
      });
    } catch (error) {
      console.error("EMOVEL PDF storage upload failed.", {
        category: "storage_failed",
        projectId: project.id,
        message: error instanceof Error ? error.message : "Unknown storage failure.",
      });

      return pdfExportError({
        status: 500,
        category: "storage_failed",
        code: "PDF_STORAGE_FAILED",
        message: "PDF storage upload failed.",
      });
    }

    try {
      await recordPdfExport(context, workspace.id, {
        id: pdfExportId,
        projectId: project.id,
        storagePath,
        signedUrlExpiresAt: expiresAt,
      });
    } catch (error) {
      console.error("EMOVEL PDF export record failed.", {
        category: "internal_error",
        projectId: project.id,
        message: error instanceof Error ? error.message : "Unknown PDF export record failure.",
      });

      return pdfExportError({
        status: 500,
        category: "internal_error",
        code: "PDF_EXPORT_RECORD_FAILED",
        message: "PDF export record failed.",
      });
    }

    let signedUrl: string;

    try {
      signedUrl = await createPrivatePdfSignedUrl({
        storagePath,
        expiresInSeconds: SIGNED_URL_TTL_SECONDS,
      });
    } catch (error) {
      console.error("EMOVEL PDF signed URL failed.", {
        category: "signed_url_failed",
        projectId: project.id,
        message: error instanceof Error ? error.message : "Unknown signed URL failure.",
      });

      return pdfExportError({
        status: 500,
        category: "signed_url_failed",
        code: "PDF_SIGNED_URL_FAILED",
        message: "PDF signed URL creation failed.",
      });
    }

    const warnings = normalized.warnings;

    try {
      await recordExport(context, workspace.id, {
        projectId: project.id,
        format: "pdf",
        storagePath,
        contentHash: contentHash(pdf),
      });
    } catch (error) {
      console.warn("EMOVEL generic PDF export history record failed.", {
        category: "record_export_failed",
        projectId: project.id,
        message: error instanceof Error ? error.message : "Unknown generic export record failure.",
      });
      warnings.push("Generic export history could not be recorded. PDF export is still available.");
    }

    return Response.json({
      fileName: `${slugify(project.name)}.pdf`,
      signedUrl,
      expiresAt,
      exportId: pdfExportId,
      warnings,
    });
  } catch (error) {
    return mapPdfExportError(error);
  }
}
