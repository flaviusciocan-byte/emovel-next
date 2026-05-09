import { buildKnowledgePromptSectionForModule } from "../emovel-core/knowledge-prompt-adapter";
import type { BoundaryResult } from "./boundary";

type BuildKnowledgePromptSection = typeof buildKnowledgePromptSectionForModule;

export const KNOWLEDGE_INJECTION_ENV_KEY = "ENABLE_KNOWLEDGE_INJECTION";

export function isKnowledgeInjectionEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env[KNOWLEDGE_INJECTION_ENV_KEY] === "true";
}

export function getKnowledgeModuleForGeneration(boundary: BoundaryResult) {
  if (!boundary.allowed) {
    return null;
  }

  if (boundary.category === "monetization") {
    return "offer_builder" as const;
  }

  return null;
}

export async function getKnowledgePromptSectionForGeneration(input: {
  boundary: BoundaryResult;
  env?: NodeJS.ProcessEnv;
  buildKnowledgePromptSection?: BuildKnowledgePromptSection;
}) {
  if (!isKnowledgeInjectionEnabled(input.env)) {
    return null;
  }

  const moduleId = getKnowledgeModuleForGeneration(input.boundary);

  if (!moduleId) {
    return null;
  }

  try {
    const section = await (input.buildKnowledgePromptSection || buildKnowledgePromptSectionForModule)(
      moduleId,
    );

    return section.promptSection;
  } catch (error) {
    console.warn("EMOVEL knowledge injection skipped.", {
      moduleId,
      reason: error instanceof Error ? error.message : "Unknown knowledge injection error.",
    });

    return null;
  }
}
