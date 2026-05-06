import type {
  TemplateDesignDensityV1,
  TemplateSectionTypeV1,
  TemplateSpecV1,
  TemplateStylePresetV1,
  TemplateSpecValidationResult,
} from "./schema/v1";

export type SectionType = TemplateSectionTypeV1;

export type StylePreset = TemplateStylePresetV1;

export type DesignDensity = TemplateDesignDensityV1;

export type BuilderSection = TemplateSpecV1["sections"][number];

export type BuilderSpec = TemplateSpecV1;

export type ValidationResult = TemplateSpecValidationResult;

export interface OutputSectionPlan {
  id: string;
  type: SectionType;
  title: string;
  component: string;
}

export interface OutputPlan {
  templateName: string;
  outputPath: string;
  folders: string[];
  files: string[];
  sections: OutputSectionPlan[];
  components: string[];
  exportAssets: string[];
}

export interface ResolvedStyle {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  font: string;
  maxWidth: string;
  sectionPadding: string;
  radius: string;
}

export interface ExportManifest {
  schemaVersion: "v1";
  templateId: TemplateSpecV1["templateId"];
  spec: TemplateSpecV1;
  validation: ValidationResult;
  style: ResolvedStyle;
  generatedAt: string;
}
