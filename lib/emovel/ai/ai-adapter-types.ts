import type { PromptToBriefInputV0 } from "../compiler/prompt-to-brief";
import type { EmovelGeneratedAppSchemaV0 } from "../schema/app-schema.v0";

export type EmovelAppFactoryAIAdapterModeV0 = "deterministic-placeholder";

export interface EmovelAppFactoryAIAdapterInputV0 extends PromptToBriefInputV0 {
  requestId?: string;
}

export interface EmovelAppFactoryAIAdapterMetadataV0 {
  mode: EmovelAppFactoryAIAdapterModeV0;
  generatedAt: string;
  warnings: string[];
}

export interface EmovelAppFactoryAIAdapterResultV0 {
  schema: EmovelGeneratedAppSchemaV0;
  metadata: EmovelAppFactoryAIAdapterMetadataV0;
}
