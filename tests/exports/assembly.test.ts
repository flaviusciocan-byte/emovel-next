import { describe, expect, it } from "vitest";

import {
  assembleMarkdown,
  assembleTxt,
  normalizeExportSections,
} from "../../lib/exports/assembly";
import type { BrandProfile, Project, SectionRecord } from "../../lib/emovel-ai/types";

const project: Project = {
  id: "project-1",
  user_id: "user-1",
  workspace_id: "workspace-1",
  brand_profile_id: "brand-1",
  name: "Founder Signal Page",
  product_type: "authority_page",
  commercial_goal: "Convert premium advisory interest.",
  fixed_section_order: ["hero", "mechanism", "proof"],
  status: "draft",
  created_at: "2026-05-07T00:00:00.000Z",
  updated_at: "2026-05-07T00:00:00.000Z",
};

const brandProfile: BrandProfile = {
  id: "brand-1",
  user_id: "user-1",
  workspace_id: "workspace-1",
  brand_name: "EMOVEL",
  audience: "Founders",
  tone: "Calm premium",
  visual_direction: "Luxury tech",
  offer_positioning: "Controlled commercial execution",
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

describe("export assembly", () => {
  it("includes the project title in markdown", () => {
    const markdown = assembleMarkdown(project, [
      section({ section_key: "hero", position: 0, status: "accepted", title: "Opening" }),
    ]);

    expect(markdown).toContain("# Founder Signal Page");
  });

  it("orders sections by fixed section order", () => {
    const normalized = normalizeExportSections([
      section({ section_key: "proof", position: 0, status: "accepted", title: "Proof" }),
      section({ section_key: "hero", position: 2, status: "accepted", title: "Hero" }),
      section({ section_key: "mechanism", position: 1, status: "accepted", title: "Mechanism" }),
    ], project.fixed_section_order);

    expect(normalized.sections.map((item) => item.sectionKey)).toEqual([
      "hero",
      "mechanism",
      "proof",
    ]);
  });

  it("excludes internal metadata from exported content", () => {
    const markdown = assembleMarkdown(project, [
      section({
        section_key: "hero",
        position: 0,
        status: "accepted",
        content: {
          templateSpecSection: {
            title: "Hero",
            objective: "Present the offer clearly.",
          },
          specSnapshot: {
            internal: "should not be exported",
          },
        },
      }),
    ]);

    expect(markdown).toContain("Present the offer clearly.");
    expect(markdown).not.toContain("specSnapshot");
    expect(markdown).not.toContain("internal");
    expect(markdown).not.toContain("user-1");
    expect(markdown).not.toContain("workspace-1");
  });

  it("falls back to ready sections with a warning when no accepted sections exist", () => {
    const normalized = normalizeExportSections([
      section({ section_key: "hero", position: 0, status: "ready", title: "Ready Hero" }),
    ], project.fixed_section_order);
    const markdown = assembleMarkdown(project, [
      section({ section_key: "hero", position: 0, status: "ready", title: "Ready Hero" }),
    ]);

    expect(normalized.usedReadyFallback).toBe(true);
    expect(normalized.warnings[0]).toContain("No accepted sections");
    expect(markdown).toContain("## Export Warning");
  });

  it("handles empty sections safely", () => {
    expect(assembleTxt(project, [], brandProfile)).toContain(
      "No accepted or ready sections are available for export.",
    );
  });
});
