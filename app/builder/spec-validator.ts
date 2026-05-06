import { validateTemplateSpecV1 } from "./schema/v1";
import type { BuilderSpec, ValidationResult } from "./types";

export function validateSpec(spec: BuilderSpec): ValidationResult {
  return validateTemplateSpecV1(spec);
}
