import type { TemplateSpecV1 } from "../../app/builder/schema/v1";
import type { ProjectWithSections } from "../emovel-ai/data-access";
import type { BrandProfile } from "../emovel-ai/types";
import type { BoundaryResult } from "./boundary";

function compactJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function buildTemplateSpecPrompt(input: {
  brief: string;
  boundary: BoundaryResult;
  brandProfile: BrandProfile | null;
  project: ProjectWithSections;
  currentSpec: TemplateSpecV1 | null;
  knowledgePromptSection?: string | null;
}) {
  const brandContext = input.brandProfile
    ? {
        brand_name: input.brandProfile.brand_name,
        audience: input.brandProfile.audience,
        tone: input.brandProfile.tone,
        visual_direction: input.brandProfile.visual_direction,
        offer_positioning: input.brandProfile.offer_positioning,
      }
    : null;
  const projectContext = {
    id: input.project.id,
    name: input.project.name,
    product_type: input.project.product_type,
    commercial_goal: input.project.commercial_goal,
    fixed_section_order: input.project.fixed_section_order,
    existing_sections: input.project.sections.map((section) => ({
      id: section.id,
      section_key: section.section_key,
      title: section.title,
      status: section.status,
    })),
  };

  const systemParts = [
    "You generate EMOVEL Builder Template Spec v1 JSON only.",
    "Return one valid JSON object. Do not include markdown, comments, prose, or code fences.",
    "The output must match schemaVersion \"v1\" exactly.",
    "Use only supported templateId values, stylePreset values, designDensity values, section types, component names, and pricingModel enum values.",
    "Keep the tone premium, calm, editorial, cinematic, luxury tech, mature, and commercial.",
    "Do not invent fake claims, fake testimonials, fake metrics, fake guarantees, or fake integrations.",
    "Every section must have a clear conversion role.",
    "Prefer 6 to 9 sections unless the brief clearly needs fewer.",
  ];

  if (input.knowledgePromptSection) {
    systemParts.push("", input.knowledgePromptSection);
  }

  const system = systemParts.join("\n");

  const user = [
    "Generate a Template Spec v1 for this Builder request.",
    "",
    `Boundary category: ${input.boundary.category}`,
    `Boundary intent: ${input.boundary.normalizedIntent || input.brief}`,
    "",
    "User brief:",
    input.brief,
    "",
    "Brand Profile context:",
    compactJson(brandContext),
    "",
    "Project context:",
    compactJson(projectContext),
    "",
    "Current selected spec, if any:",
    compactJson(input.currentSpec),
  ].join("\n");

  return {
    system,
    user,
  };
}
