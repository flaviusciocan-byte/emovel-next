import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getBrandProfile: vi.fn(),
  getOrCreateUserWorkspace: vi.fn(),
  getProjectWithSections: vi.fn(),
  recordExport: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => ({
  requireAuth: mocks.requireAuth,
}));

vi.mock("../../lib/emovel-ai/data-access", () => ({
  getBrandProfile: mocks.getBrandProfile,
  getOrCreateUserWorkspace: mocks.getOrCreateUserWorkspace,
  getProjectWithSections: mocks.getProjectWithSections,
  recordExport: mocks.recordExport,
}));

import { POST as markdownPost } from "../../app/api/exports/markdown/route";
import { POST as txtPost } from "../../app/api/exports/txt/route";
import type { Project, SectionRecord } from "../../lib/emovel-ai/types";

const project: Project = {
  id: "project-1",
  user_id: "user-1",
  workspace_id: "workspace-1",
  brand_profile_id: null,
  name: "Founder Signal Page",
  product_type: "authority_page",
  commercial_goal: "Convert premium advisory interest.",
  fixed_section_order: ["hero", "mechanism", "proof"],
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
  return new Request("https://emovel.test/api/exports/markdown", {
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
  mocks.getBrandProfile.mockResolvedValue(null);
  mocks.recordExport.mockResolvedValue({
    id: "export-1",
    user_id: "user-1",
    workspace_id: "workspace-1",
    project_id: project.id,
    format: "markdown",
    storage_path: null,
    content_hash: "hash",
    created_at: "2026-05-07T00:00:00.000Z",
  });
}

describe("Markdown/TXT export routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedWorkspace();
  });

  it("returns 401 with a structured error when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValue(new Error("Authentication required."));

    const response = await markdownPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Authentication required.",
      code: "AUTH_REQUIRED",
      category: "unauthorized",
    });
  });

  it("returns 400 with a structured error when projectId is missing", async () => {
    const response = await markdownPost(exportRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Project is required for export.",
      code: "PROJECT_REQUIRED",
      category: "invalid_request",
    });
  });

  it("returns 404 with a structured error when the project is not found or not owned", async () => {
    mocks.getProjectWithSections.mockResolvedValue(null);

    const response = await markdownPost(exportRequest({ projectId: "other-project" }));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: "Project not found.",
      code: "PROJECT_NOT_FOUND",
      category: "not_found",
    });
  });

  it("returns filename and content for successful markdown export", async () => {
    mocks.getProjectWithSections.mockResolvedValue({
      ...project,
      sections: [
        section({
          section_key: "hero",
          position: 0,
          status: "accepted",
          content: {
            templateSpecSection: {
              title: "Opening",
              objective: "Present the premium offer clearly.",
            },
          },
        }),
      ],
    });

    const response = await markdownPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fileName).toBe("founder-signal-page.md");
    expect(data.content).toContain("# Founder Signal Page");
    expect(data.content).toContain("Present the premium offer clearly.");
    expect(data.exportId).toBe("export-1");
  });

  it("returns filename and content for successful txt export", async () => {
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

    const response = await txtPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fileName).toBe("founder-signal-page.txt");
    expect(data.contentType).toBe("text/plain; charset=utf-8");
    expect(data.content).toContain("Founder Signal Page");
    expect(data.content).toContain("1. Opening");
  });

  it("does not block export when recordExport fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
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
    mocks.recordExport.mockRejectedValue(new Error("database policy rejected insert"));

    const response = await markdownPost(exportRequest({ projectId: project.id }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fileName).toBe("founder-signal-page.md");
    expect(data.exportId).toBeNull();
    expect(data.warnings).toContain(
      "Export history could not be recorded. File content was still generated.",
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "EMOVEL export history record failed.",
      expect.objectContaining({
        category: "record_export_failed",
        projectId: project.id,
      }),
    );
  });
});
