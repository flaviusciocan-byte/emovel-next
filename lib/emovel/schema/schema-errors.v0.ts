export type EmovelSchemaValidationSeverityV0 = "error" | "warning";

export interface EmovelSchemaValidationError {
  path: string;
  message: string;
  severity: EmovelSchemaValidationSeverityV0;
}

export function createSchemaError(
  path: string,
  message: string,
  severity: EmovelSchemaValidationSeverityV0 = "error",
): EmovelSchemaValidationError {
  return {
    path,
    message,
    severity,
  };
}
