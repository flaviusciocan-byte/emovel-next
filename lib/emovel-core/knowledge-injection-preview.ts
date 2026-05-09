import {
  type EmovelKnowledgePromptOptions,
  type EmovelKnowledgePromptSection,
  buildKnowledgePromptSectionForModule,
} from "./knowledge-prompt-adapter";
import { type EmovelKnowledgeModuleId } from "./knowledge-registry";

export const ALLOWED_KNOWLEDGE_PREVIEW_MODULES: readonly EmovelKnowledgeModuleId[] = [
  "brand_system",
  "offer_builder",
  "landing_page_builder",
  "instagram_builder",
  "product_builder",
  "automation_engine",
] as const;

export interface KnowledgeInjectionPreview {
  moduleId: EmovelKnowledgeModuleId;
  promptSection: string;
  documentIds: EmovelKnowledgePromptSection["documentIds"];
  documentCount: number;
  truncatedDocumentIds: EmovelKnowledgePromptSection["truncatedDocumentIds"];
  promptWasTruncated: boolean;
}

export function isAllowedKnowledgePreviewModule(
  moduleId: string,
): moduleId is EmovelKnowledgeModuleId {
  return ALLOWED_KNOWLEDGE_PREVIEW_MODULES.includes(moduleId as EmovelKnowledgeModuleId);
}

export async function createKnowledgeInjectionPreview(
  moduleId: string,
  options: EmovelKnowledgePromptOptions = {},
): Promise<KnowledgeInjectionPreview> {
  if (!isAllowedKnowledgePreviewModule(moduleId)) {
    throw new Error(`Unsupported EMOVEL knowledge preview module: ${moduleId}`);
  }

  const promptSection = await buildKnowledgePromptSectionForModule(moduleId, options);

  return {
    moduleId: promptSection.moduleId,
    promptSection: promptSection.promptSection,
    documentIds: [...promptSection.documentIds],
    documentCount: promptSection.documentCount,
    truncatedDocumentIds: [...promptSection.truncatedDocumentIds],
    promptWasTruncated: promptSection.promptWasTruncated,
  };
}
