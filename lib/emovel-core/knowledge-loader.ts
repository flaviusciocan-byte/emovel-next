import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  type EmovelKnowledgeDocument,
  type EmovelKnowledgeModuleId,
  getKnowledgeForModule,
} from "./knowledge-registry";

export interface LoadedEmovelKnowledgeDocument extends EmovelKnowledgeDocument {
  content: string;
}

export interface LoadedEmovelKnowledgeForModule {
  moduleId: EmovelKnowledgeModuleId;
  primary: LoadedEmovelKnowledgeDocument[];
  supporting: LoadedEmovelKnowledgeDocument[];
}

async function loadDocumentContent(
  document: EmovelKnowledgeDocument,
): Promise<LoadedEmovelKnowledgeDocument> {
  const absolutePath = path.join(process.cwd(), "docs", "emovel-core", path.basename(document.filePath));
  const content = await readFile(absolutePath, "utf8");

  return {
    ...document,
    content,
  };
}

export async function loadKnowledgeForModule(
  moduleId: EmovelKnowledgeModuleId,
): Promise<LoadedEmovelKnowledgeForModule> {
  const knowledge = getKnowledgeForModule(moduleId);
  const [primary, supporting] = await Promise.all([
    Promise.all(knowledge.primary.map(loadDocumentContent)),
    Promise.all(knowledge.supporting.map(loadDocumentContent)),
  ]);

  return {
    moduleId,
    primary,
    supporting,
  };
}
