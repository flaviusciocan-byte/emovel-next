import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  checkPlanLimit: vi.fn(),
  getBrandProfile: vi.fn(),
  getOrCreateUserWorkspace: vi.fn(),
  getProjectWithSections: vi.fn(),
  recordExport: vi.fn(),
  recordPdfExport: vi.fn(),
  acceptSection: vi.fn(),
  incrementUsageCounter: vi.fn(),
  generateProjectPdf: vi.fn(),
  uploadPrivatePdf: vi.fn(),
  createPrivatePdfSignedUrl: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => ({
  requireAuth: mocks.requireAuth,
}));

vi.mock("../../lib/emovel-ai/data-access", () => ({
  checkPlanLimit: mocks.checkPlanLimit,
  getBrandProfile: mocks.getBrandProfile,
  getOrCreateUserWorkspace: mocks.getOrCreateUserWorkspace,
  getProjectWithSections: mocks.getProjectWithSections,
  recordExport: mocks.recordExport,
  recordPdfExport: mocks.recordPdfExport,
  acceptSection: mocks.acceptSection,
  incrementUsageCounter: mocks.incrementUsageCounter,
}));

vi.mock("../../lib/exports/pdf", () => ({
  generateProjectPdf: mocks.generateProjectPdf,
}));

vi.mock("../../lib/exports/pdf-storage", () => ({
  uploadPrivatePdf: mocks.uploadPrivatePdf,
  createPrivatePdfSignedUrl: mocks.createPrivatePdfSignedUrl,
}));

import { POST as pdfPost } from "../../app/api/exports/pdf/route";
import type { Project, SectionRecord } from "../../lib/emovel-ai/types";

const project: Project = {
  id: "project-1",
  user_id: "user-1",
  workspace_id: "workspace-1",
  brand_profile_id: null,
  name: "Founder Signal Page",
  product_type: "authority_page",
  commercial_goal: "Convert premium advisory interest.",
  fixed_section_order: ["hero", "proof"],
  status: "draft",
  created_at: "2026-05-07T00:00:00.000Z",
  updated_at: "2026-05-07T00:00:00.000Z",
};

function section(input: Partial<SectionRecord> & Pick<SectionRecord, "section_key" | "position">): SectionRecord {
  return {
    id: `${input.section_key}-id`,
    user_id: "user-1",
    workspace_id: "workspace-1",
    project_id: project.id,
    title: null,
    content: {},
    status: "ready",
    error_message: null,
    created_at: "2026-05-07T00:00:00.000Z",
    updated_at: "2026-05-07T00:00:00.000Z",
    ...input,
  };
}

function exportRequest(body: unknown) {
  return new Request("https://emovel.test/api/exports/pdf", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
    },
    body: JSON.stringify(body),
  });
}

function mockAuthenticatedWorkspace() {
  mocks.requireAuth.mockResolvedValue({
    user: { id: "user-1", email: "founder@emovel.test" },
    accessToken: "test-token",
  });
  mocks.getOrCreateUserWorkspace.mockResolvedValue({
    id: "workspace-1",
    user_id: "user-1",
    name: "Personal Workspace",
    kind: "personal",
    created_at: "2026-05-07T00:00:00.000Z",
    updated_at: "2026-05-07T00:00:00.000Z",
  });
  mocks.getProjectWithSections.mockResolvedValue({
    ...project,
    sections: [
      section({
        section_key: "hero",
        position: 0,
        status: "accepted",
        title: "Opening",
      }),
    ],
  });
  mocks.getBrandProfile.mockResolvedValue(null);
  mocks.checkPlanLimit.mockResolvedValue({
    allowed: true,
    reason: null,
    profile: { id: "user-1", plan: "pro" },
    limits: { canExportPdf: true },
    projectCount: 1,
  });
  mocks.generateProjectPdf.mockResolvedValue(Buffer.from("%PDF-1.7"));
  mocks.uploadPrivatePdf.mockResolvedValue(undefined);
  mocks.recordPdfExport.mockResolvedValue({
    id: "pdf-export-1",
    user_id: "user-1",
    workspace_id: "workspace-1",
    project_id: project.id,
    storage_path: "user-1/project-1/pdf-export-1.pdf",
    signed_url_expires_at: "2026-05-07T00:15:00.000Z",
    created_at: "2026-05-07T00:00:00.000Z",
  });
  mocks.createPrivatePdfSignedUrl.mockResolvedValue(
    "https://supabase.test/storage/v1/object/sign/pdf_exports/user-1/project-1/pdf-export-1.pdf?token=signed",
  );
  mocks.recordExport.mockResolvedValue({
    id: "generic-export-1",
    user_id: "user-1",
    workspace_id: "workspace-1",
    project_id: project.id,
    format: "pdf",
    storage_path: "user-1/project-1/pdf-export-1.pdf",
    content_hash: "hash",
    created_at: "2026-05-07T00:00:00.000Z",
  });
}

describe("PDF export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedWorkspace();
  });

  it("returns 401 with a structured error when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValue(new Error("Authentication required."));

    const response = await pdfPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Authentication required.",
      code: "AUTH_REQUIRED",
      category: "unauthorized",
    });
  });

  it("returns 400 with a structured error when projectId is missing", async () => {
    const response = await pdfPost(exportRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Project is required for PDF export.",
      code: "PROJECT_REQUIRED",
      category: "invalid_request",
    });
  });

  it("returns 404 with a structured error when the project is not found or not owned", async () => {
    mocks.getProjectWithSections.mockResolvedValue(null);

    const response = await pdfPost(exportRequest({ projectId: "other-project" }));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: "Project not found.",
      code: "PROJECT_NOT_FOUND",
      category: "not_found",
    });
  });

  it("returns 403 billing_gate for free plan", async () => {
    mocks.checkPlanLimit.mockResolvedValue({
      allowed: false,
      reason: "PDF export requires Pro.",
      profile: { id: "user-1", plan: "free" },
      limits: { canExportPdf: false },
      projectCount: 1,
    });

    const response = await pdfPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({
      error: "PDF export requires Pro.",
      code: "PDF_EXPORT_REQUIRES_PRO",
      category: "billing_gate",
    });
    expect(mocks.generateProjectPdf).not.toHaveBeenCalled();
  });

  it("returns signedUrl and fileName for successful Pro PDF export", async () => {
    const response = await pdfPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fileName).toBe("founder-signal-page.pdf");
    expect(data.signedUrl).toContain("/storage/v1/object/sign/pdf_exports/");
    expect(data.exportId).toEqual(expect.any(String));
    expect(data.expiresAt).toEqual(expect.any(String));
    expect(mocks.uploadPrivatePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: expect.stringMatching(/^user-1\/project-1\/.+\.pdf$/),
        pdf: Buffer.from("%PDF-1.7"),
      }),
    );
    expect(mocks.recordPdfExport).toHaveBeenCalled();
    expect(mocks.recordExport).toHaveBeenCalledWith(
      expect.any(Object),
      "workspace-1",
      expect.objectContaining({
        projectId: project.id,
        format: "pdf",
      }),
    );
  });

  it("returns storage_failed when private PDF upload fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.uploadPrivatePdf.mockRejectedValue(new Error("storage unavailable"));

    const response = await pdfPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "PDF storage upload failed.",
      code: "PDF_STORAGE_FAILED",
      category: "storage_failed",
    });
    expect(mocks.recordPdfExport).not.toHaveBeenCalled();
    expect(mocks.createPrivatePdfSignedUrl).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "EMOVEL PDF storage upload failed.",
      expect.objectContaining({ category: "storage_failed" }),
    );
  });

  it("returns signed_url_failed when signed URL creation fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.createPrivatePdfSignedUrl.mockRejectedValue(new Error("signing failed"));

    const response = await pdfPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "PDF signed URL creation failed.",
      code: "PDF_SIGNED_URL_FAILED",
      category: "signed_url_failed",
    });
    expect(mocks.recordPdfExport).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "EMOVEL PDF signed URL failed.",
      expect.objectContaining({ category: "signed_url_failed" }),
    );
  });

  it("does not mark sections accepted or increment AI usage", async () => {
    const response = await pdfPost(exportRequest({ projectId: project.id }));

    expect(response.status).toBe(200);
    expect(mocks.acceptSection).not.toHaveBeenCalled();
    expect(mocks.incrementUsageCounter).not.toHaveBeenCalled();
  });
});
