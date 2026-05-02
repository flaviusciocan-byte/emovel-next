export type SectionType = "hero" | "mechanism" | "proof" | "features" | "cta" | "faq";

export type StylePreset = "premium-dark" | "light-clean" | "editorial-warm";

export type DesignDensity = "focused" | "premium" | "dense";

export interface BuilderSection {
  id: string;
  type: SectionType;
  title: string;
  objective: string;
}

export interface BuilderSpec {
  templateName: string;
  pageType: string;
  positioning: string;
  targetAudience: string;
  offer: string;
  sections: BuilderSection[];
  stylePreset: StylePreset;
  designDensity: DesignDensity;
}

export interface ValidationResult {
  missingFields: string[];
  sectionIssues: string[];
  readinessScore: number;
  isReady: boolean;
}

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
  generatedAt: string;
  spec: BuilderSpec;
  validation: ValidationResult;
  outputPlan: OutputPlan;
  style: ResolvedStyle;
}
