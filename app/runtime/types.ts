export type RuntimeSectionType = "hero" | "mechanism" | "proof" | "features" | "cta" | "faq";

export type RuntimeStylePreset = "premium-dark" | "light-clean" | "editorial-warm";

export type RuntimeDesignDensity = "focused" | "premium" | "dense";

export interface RuntimeSection {
  id: string;
  type: RuntimeSectionType;
  title: string;
  objective: string;
  content?: string[];
}

export interface RuntimeManifest {
  version: "1";
  templateName: string;
  pageType: string;
  positioning: string;
  targetAudience: string;
  offer: string;
  stylePreset: RuntimeStylePreset;
  designDensity: RuntimeDesignDensity;
  sections: RuntimeSection[];
}

export interface RuntimeStyleTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  maxWidth: string;
  sectionPadding: string;
  radius: string;
}

export interface RuntimeValidationResult {
  manifest: RuntimeManifest | null;
  errors: string[];
}
