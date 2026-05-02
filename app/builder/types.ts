export type BlockType =
  | "hero"
  | "features"
  | "proof"
  | "pricing"
  | "faq"
  | "cta"
  | "footer"
  | "text";

export interface BuilderBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface PageConfig {
  title: string;
  description: string;
  theme: "dark" | "light";
  accentColor: string;
  font: string;
  blocks: BuilderBlock[];
}

export interface DomainConfig {
  type: "subdomain" | "custom";
  value: string;
}

export interface MobileConfig {
  appName: string;
  packageId: string;
  platforms: ("android" | "ios")[];
  version: string;
}

export interface LocalExportRecord {
  id: string;
  createdAt: string;
  previewPath: string;
  blockCount: number;
}
