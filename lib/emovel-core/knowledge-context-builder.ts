import {
  type LoadedEmovelKnowledgeDocument,
  type LoadedEmovelKnowledgeForModule,
  loadKnowledgeForModule,
} from "./knowledge-loader";
import { type EmovelKnowledgeDocumentId, type EmovelKnowledgeModuleId } from "./knowledge-registry";

const DEFAULT_MAX_CHARACTERS_PER_DOCUMENT = 4_000;

export interface EmovelKnowledgeContextOptions {
  maxCharactersPerDocument?: number;
}

export interface EmovelKnowledgeContext {
  moduleId: EmovelKnowledgeModuleId;
  contextBlock: string;
  documentCount: number;
  truncatedDocumentIds: EmovelKnowledgeDocumentId[];
}

function normalizeMarkdown(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function limitContent(content: string, maxCharacters: number) {
  if (content.length <= maxCharacters) {
    return {
      content,
      truncated: false,
    };
  }

  return {
    content: `${content.slice(0, maxCharacters).trimEnd()}\n\n[Content truncated for compact context.]`,
    truncated: true,
  };
}

function formatDocument(
  usage: "primary" | "supporting",
  document: LoadedEmovelKnowledgeDocument,
  maxCharacters: number,
) {
  const normalizedContent = normalizeMarkdown(document.content);
  const limited = limitContent(normalizedContent, maxCharacters);
  const block = [
    `### ${usage.toUpperCase()}: ${document.title}`,
    `Document ID: ${document.id}`,
    `Purpose: ${document.purpose}`,
    "",
    limited.content,
  ].join("\n");

  return {
    block,
    truncated: limited.truncated,
  };
}

export function createKnowledgeContextBlock(
  knowledge: LoadedEmovelKnowledgeForModule,
  options: EmovelKnowledgeContextOptions = {},
): EmovelKnowledgeContext {
  const maxCharactersPerDocument =
    options.maxCharactersPerDocument ?? DEFAULT_MAX_CHARACTERS_PER_DOCUMENT;
  const truncatedDocumentIds: EmovelKnowledgeDocumentId[] = [];
  const documentBlocks = [
    ...knowledge.primary.map((document) => ({ usage: "primary" as const, document })),
    ...knowledge.supporting.map((document) => ({ usage: "supporting" as const, document })),
  ].map(({ usage, document }) => {
    const formatted = formatDocument(usage, document, maxCharactersPerDocument);

    if (formatted.truncated) {
      truncatedDocumentIds.push(document.id);
    }

    return formatted.block;
  });

  return {
    moduleId: knowledge.moduleId,
    contextBlock: [
      "## EMOVEL Knowledge Core Context",
      `Module: ${knowledge.moduleId}`,
      "Use this as internal reference only. Do not quote these documents verbatim unless explicitly requested.",
      "",
      ...documentBlocks,
    ].join("\n\n"),
    documentCount: knowledge.primary.length + knowledge.supporting.length,
    truncatedDocumentIds,
  };
}

export async function buildKnowledgeContextForModule(
  moduleId: EmovelKnowledgeModuleId,
  options: EmovelKnowledgeContextOptions = {},
): Promise<EmovelKnowledgeContext> {
  const knowledge = await loadKnowledgeForModule(moduleId);

  return createKnowledgeContextBlock(knowledge, options);
}
