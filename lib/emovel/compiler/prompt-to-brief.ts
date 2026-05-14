import type { EmovelAppCategoryV0, EmovelProductBriefV0 } from "../schema/app-schema.v0";

export interface PromptToBriefInputV0 {
  prompt: string;
  category?: EmovelAppCategoryV0;
  constraints?: string[];
}

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ");
}

function titleFromPrompt(prompt: string) {
  const firstSentence = normalizePrompt(prompt).split(/[.!?]/)[0] ?? "Generated App";
  return firstSentence.slice(0, 80) || "Generated App";
}

export function createProductBriefFromPromptV0(input: PromptToBriefInputV0): EmovelProductBriefV0 {
  const prompt = normalizePrompt(input.prompt);
  const title = titleFromPrompt(prompt);

  return {
    title,
    summary: prompt || "Define a controlled EMOVEL app from a user prompt.",
    problem: "The user needs a structured product experience generated from an unstructured prompt.",
    promise: "Convert the prompt into a product brief, screen map, component map, theme pack, and schema.",
    primaryUseCase: input.category ?? "commerce",
    positioning: "Premium, controlled, EMOVEL-owned app foundation.",
    constraints: [
      "No external repository integration.",
      "No copied third-party builder systems.",
      "No UI page, deployment logic, or mobile runtime.",
      ...(input.constraints ?? []),
    ],
  };
}
