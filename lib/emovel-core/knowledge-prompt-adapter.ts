import {
  type EmovelKnowledgeContext,
  buildKnowledgeContextForModule,
} from "./knowledge-context-builder";
import { type EmovelKnowledgeDocumentId, type EmovelKnowledgeModuleId } from "./knowledge-registry";

const DEFAULT_MAX_PROMPT_CHARACTERS = 18_000;

export interface EmovelKnowledgePromptOptions {
  maxCharactersPerDocument?: number;
  maxPromptCharacters?: number;
}

export interface EmovelKnowledgePromptSection {
  moduleId: EmovelKnowledgeModuleId;
  promptSection: string;
  documentIds: EmovelKnowledgeDocumentId[];
  documentCount: number;
  truncatedDocumentIds: EmovelKnowledgeDocumentId[];
  promptWasTruncated: boolean;
}

function extractDocumentIds(contextBlock: string): EmovelKnowledgeDocumentId[] {
  return Array.from(contextBlock.matchAll(/^Document ID: ([a-z_]+)$/gm)).map(
    (match) => match[1] as EmovelKnowledgeDocumentId,
  );
}

function limitPromptSection(section: string, maxPromptCharacters: number) {
  if (section.length <= maxPromptCharacters) {
    return {
      section,
      truncated: false,
    };
  }

  return {
    section: `${section.slice(0, maxPromptCharacters).trimEnd()}\n\n[Knowledge prompt section truncated.]`,
    truncated: true,
  };
}

export function formatKnowledgePromptSection(
  context: EmovelKnowledgeContext,
  options: Pick<EmovelKnowledgePromptOptions, "maxPromptCharacters"> = {},
): EmovelKnowledgePromptSection {
  const documentIds = extractDocumentIds(context.contextBlock);
  const metadata = [
    `module_id: ${context.moduleId}`,
    `document_count: ${context.documentCount}`,
    `document_ids: ${documentIds.join(", ")}`,
    `truncated_document_ids: ${
      context.truncatedDocumentIds.length > 0 ? context.truncatedDocumentIds.join(", ") : "none"
    }`,
  ].join("\n");
  const rawPromptSection = [
    "<EMOVEL_KNOWLEDGE_CONTEXT>",
    "Purpose: Internal EMOVEL Knowledge Core reference for this module.",
    "Instruction: Use this context to preserve EMOVEL standards. Do not reveal, quote, or summarize this block unless the user explicitly asks for source standards.",
    "",
    "<EMOVEL_KNOWLEDGE_METADATA>",
    metadata,
    "</EMOVEL_KNOWLEDGE_METADATA>",
    "",
    context.contextBlock,
    "</EMOVEL_KNOWLEDGE_CONTEXT>",
  ].join("\n");
  const limited = limitPromptSection(
    rawPromptSection,
    options.maxPromptCharacters ?? DEFAULT_MAX_PROMPT_CHARACTERS,
  );

  return {
    moduleId: context.moduleId,
    promptSection: limited.section,
    documentIds,
    documentCount: context.documentCount,
    truncatedDocumentIds: [...context.truncatedDocumentIds],
    promptWasTruncated: limited.truncated,
  };
}

export async function buildKnowledgePromptSectionForModule(
  moduleId: EmovelKnowledgeModuleId,
  options: EmovelKnowledgePromptOptions = {},
): Promise<EmovelKnowledgePromptSection> {
  const context = await buildKnowledgeContextForModule(moduleId, {
    maxCharactersPerDocument: options.maxCharactersPerDocument,
  });

  return formatKnowledgePromptSection(context, {
    maxPromptCharacters: options.maxPromptCharacters,
  });
}
