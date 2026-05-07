import { validateTemplateSpecV1, type TemplateSpecV1 } from "../../app/builder/schema/v1";

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseTemplateSpecFromText(value: string): TemplateSpecV1 {
  const cleaned = stripCodeFence(value);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("AI response did not contain a JSON object.");
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  const validation = validateTemplateSpecV1(parsed);

  if (!validation.isValid) {
    throw new Error(`AI response failed Template Spec v1 validation: ${validation.errors.join(" ")}`);
  }

  return parsed as TemplateSpecV1;
}

export function estimateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}
