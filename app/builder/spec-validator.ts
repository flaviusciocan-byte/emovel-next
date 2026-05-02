import type { BuilderSpec, ValidationResult } from "./types";

const requiredFields: { key: keyof Omit<BuilderSpec, "sections">; label: string }[] = [
  { key: "templateName", label: "Template name" },
  { key: "pageType", label: "Page type" },
  { key: "positioning", label: "Positioning" },
  { key: "targetAudience", label: "Target audience" },
  { key: "offer", label: "Offer" },
  { key: "stylePreset", label: "Style preset" },
  { key: "designDensity", label: "Design density" },
];

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function validateSpec(spec: BuilderSpec): ValidationResult {
  const missingFields = requiredFields
    .filter(({ key }) => !hasValue(spec[key]))
    .map(({ label }) => label);

  if (spec.sections.length === 0) {
    missingFields.push("Sections");
  }

  const sectionIssues = spec.sections.flatMap((section, index) => {
    const label = section.id.trim() || `section ${index + 1}`;
    const issues: string[] = [];

    if (!section.id.trim()) {
      issues.push(`Section ${index + 1} needs an id`);
    }

    if (!section.title.trim()) {
      issues.push(`${label} needs a title`);
    }

    if (!section.objective.trim()) {
      issues.push(`${label} needs an objective`);
    }

    return issues;
  });

  const readinessScore = Math.max(
    0,
    100 - missingFields.length * 10 - sectionIssues.length * 6,
  );

  return {
    missingFields,
    sectionIssues,
    readinessScore,
    isReady: missingFields.length === 0 && sectionIssues.length === 0,
  };
}
