import type { BrandProfile, Project, SectionRecord } from "../emovel-ai/types";

export interface NormalizedExportSection {
  sectionKey: string;
  title: string;
  objective: string | null;
  position: number;
}

export interface NormalizedExportSections {
  sections: NormalizedExportSection[];
  warnings: string[];
  usedReadyFallback: boolean;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function titleFromKey(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getTemplateSpecSection(section: SectionRecord) {
  const value = section.content?.templateSpecSection;

  return isRecord(value) ? value : null;
}

function publicSectionContent(section: SectionRecord): NormalizedExportSection {
  const specSection = getTemplateSpecSection(section);
  const title = cleanText(section.title) || cleanText(specSection?.title) || titleFromKey(section.section_key);
  const objective = cleanText(specSection?.objective);

  return {
    sectionKey: section.section_key,
    title,
    objective: objective || null,
    position: section.position,
  };
}

function sortByFixedOrder(sections: SectionRecord[], fixedSectionOrder: string[] = []) {
  return [...sections].sort((left, right) => {
    const leftIndex = fixedSectionOrder.indexOf(left.section_key);
    const rightIndex = fixedSectionOrder.indexOf(right.section_key);
    const leftRank = leftIndex >= 0 ? leftIndex : Number.MAX_SAFE_INTEGER;
    const rightRank = rightIndex >= 0 ? rightIndex : Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.position - right.position;
  });
}

export function normalizeExportSections(
  sections: SectionRecord[],
  fixedSectionOrder: string[] = [],
): NormalizedExportSections {
  const acceptedSections = sections.filter((section) => section.status === "accepted");
  const readySections = sections.filter((section) => section.status === "ready");
  const usedReadyFallback = acceptedSections.length === 0 && readySections.length > 0;
  const selectedSections = acceptedSections.length > 0 ? acceptedSections : readySections;
  const warnings = usedReadyFallback
    ? ["No accepted sections were found. Export includes ready sections that have not been explicitly accepted."]
    : [];

  return {
    sections: sortByFixedOrder(selectedSections, fixedSectionOrder).map(publicSectionContent),
    warnings,
    usedReadyFallback,
  };
}

function brandSummary(brandProfile?: BrandProfile | null) {
  if (!brandProfile) {
    return [];
  }

  return [
    brandProfile.brand_name ? `Brand: ${brandProfile.brand_name}` : "",
    brandProfile.audience ? `Audience: ${brandProfile.audience}` : "",
    brandProfile.tone ? `Tone: ${brandProfile.tone}` : "",
    brandProfile.visual_direction ? `Visual direction: ${brandProfile.visual_direction}` : "",
    brandProfile.offer_positioning ? `Offer positioning: ${brandProfile.offer_positioning}` : "",
  ].filter(Boolean);
}

export function assembleMarkdown(
  project: Project,
  sections: SectionRecord[],
  brandProfile?: BrandProfile | null,
) {
  const normalized = normalizeExportSections(sections, project.fixed_section_order);
  const lines = [`# ${cleanText(project.name) || "Untitled Project"}`, ""];
  const brandLines = brandSummary(brandProfile);

  if (brandLines.length > 0) {
    lines.push("## Brand Context", "", ...brandLines.map((line) => `- ${line}`), "");
  }

  if (normalized.warnings.length > 0) {
    lines.push("## Export Warning", "", ...normalized.warnings.map((warning) => `- ${warning}`), "");
  }

  if (normalized.sections.length === 0) {
    lines.push("No accepted or ready sections are available for export.", "");
    return lines.join("\n").trimEnd();
  }

  lines.push("## Sections", "");
  normalized.sections.forEach((section, index) => {
    lines.push(`### ${index + 1}. ${section.title}`, "");

    if (section.objective) {
      lines.push(section.objective, "");
    }
  });

  return lines.join("\n").trimEnd();
}

export function assembleTxt(
  project: Project,
  sections: SectionRecord[],
  brandProfile?: BrandProfile | null,
) {
  const normalized = normalizeExportSections(sections, project.fixed_section_order);
  const lines = [cleanText(project.name) || "Untitled Project", ""];
  const brandLines = brandSummary(brandProfile);

  if (brandLines.length > 0) {
    lines.push("BRAND CONTEXT", ...brandLines, "");
  }

  if (normalized.warnings.length > 0) {
    lines.push("EXPORT WARNING", ...normalized.warnings, "");
  }

  if (normalized.sections.length === 0) {
    lines.push("No accepted or ready sections are available for export.");
    return lines.join("\n").trimEnd();
  }

  lines.push("SECTIONS", "");
  normalized.sections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section.title}`);

    if (section.objective) {
      lines.push(section.objective);
    }

    lines.push("");
  });

  return lines.join("\n").trimEnd();
}
