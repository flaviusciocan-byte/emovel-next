import type { BuilderSpec, OutputPlan } from "./types";

function toComponentName(id: string) {
  const normalized = id.trim() || "section";

  return `${normalized
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("")}Section.tsx`;
}

export function buildOutputPlan(spec: BuilderSpec): OutputPlan {
  const templateName = spec.templateName.trim() || "emovel-system";
  const sections = spec.sections.map((section) => ({
    id: section.id,
    type: section.type,
    title: section.title,
    component: toComponentName(section.id),
  }));

  return {
    templateName,
    outputPath: `exports/${templateName}`,
    folders: ["app", "app/sections", "app/styles", "public/assets", "exports"],
    files: [
      "manifest.json",
      "README.md",
      "app/page.tsx",
      "app/styles/theme.css",
      ...sections.map((section) => `app/sections/${section.component}`),
    ],
    sections,
    components: sections.map((section) => section.component),
    exportAssets: [
      `${templateName}-manifest.json`,
      `${templateName}-preview.html`,
      `${templateName}-handoff.json`,
    ],
  };
}
