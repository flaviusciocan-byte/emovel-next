import type {
  RuntimeDesignDensity,
  RuntimeManifest,
  RuntimeSection,
  RuntimeSectionType,
  RuntimeStylePreset,
  RuntimeValidationResult,
} from "./types";

const sectionTypes: RuntimeSectionType[] = ["hero", "mechanism", "proof", "features", "cta", "faq"];
const stylePresets: RuntimeStylePreset[] = ["premium-dark", "light-clean", "editorial-warm"];
const densityOptions: RuntimeDesignDensity[] = ["focused", "premium", "dense"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(source: Record<string, unknown>, key: string, fallback = "") {
  return typeof source[key] === "string" ? source[key] : fallback;
}

function normalizeSection(value: unknown, index: number): RuntimeSection | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawType = getString(value, "type", "features");
  const type = sectionTypes.includes(rawType as RuntimeSectionType)
    ? (rawType as RuntimeSectionType)
    : "features";
  const content = Array.isArray(value.content)
    ? value.content.filter((item): item is string => typeof item === "string")
    : undefined;

  return {
    id: getString(value, "id", `section-${index + 1}`),
    type,
    title: getString(value, "title", `Section ${index + 1}`),
    objective: getString(value, "objective", "Define the purpose of this runtime section."),
    content,
  };
}

export function normalizeRuntimeManifest(input: unknown): RuntimeValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { manifest: null, errors: ["Manifest must be an object."] };
  }

  const source = isRecord(input.spec) ? input.spec : input;
  const rawSections = Array.isArray(source.sections) ? source.sections : [];
  const sections = rawSections
    .map((section, index) => normalizeSection(section, index))
    .filter((section): section is RuntimeSection => Boolean(section));

  if (sections.length === 0) {
    errors.push("Manifest requires at least one section.");
  }

  const rawStylePreset = getString(source, "stylePreset", "premium-dark");
  const stylePreset = stylePresets.includes(rawStylePreset as RuntimeStylePreset)
    ? (rawStylePreset as RuntimeStylePreset)
    : "premium-dark";

  const rawDensity = getString(source, "designDensity", "premium");
  const designDensity = densityOptions.includes(rawDensity as RuntimeDesignDensity)
    ? (rawDensity as RuntimeDesignDensity)
    : "premium";

  const manifest: RuntimeManifest = {
    version: "1",
    templateName: getString(source, "templateName", "emovel-system"),
    pageType: getString(source, "pageType", "landing_page"),
    positioning: getString(source, "positioning", "Controlled digital product system."),
    targetAudience: getString(source, "targetAudience", "Qualified digital product buyers."),
    offer: getString(source, "offer", "Structured execution system."),
    stylePreset,
    designDensity,
    sections,
  };

  return {
    manifest: errors.length > 0 ? null : manifest,
    errors,
  };
}
