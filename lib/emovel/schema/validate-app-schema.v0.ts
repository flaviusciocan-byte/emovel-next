import {
  COMPONENT_TYPES,
  EXPORT_TARGETS,
  type EmovelGeneratedAppSchemaV0,
} from "./app-schema.v0";
import { createSchemaError, type EmovelSchemaValidationError } from "./schema-errors.v0";

export interface EmovelAppSchemaValidationResultV0 {
  valid: boolean;
  errors: EmovelSchemaValidationError[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function hasObject(value: Record<string, unknown>, key: string) {
  return isRecord(value[key]);
}

function hasNonEmptyArray(value: Record<string, unknown>, key: string) {
  return isNonEmptyArray(value[key]);
}

function validateTopLevelObject(value: unknown, errors: EmovelSchemaValidationError[]) {
  if (!isRecord(value)) {
    errors.push(createSchemaError("$", "Schema must be an object."));
    return null;
  }

  return value;
}

function validateRequiredObjects(schema: Record<string, unknown>, errors: EmovelSchemaValidationError[]) {
  if (!hasObject(schema, "project")) {
    errors.push(createSchemaError("project", "Project info is required."));
  }

  if (!hasObject(schema, "audience")) {
    errors.push(createSchemaError("audience", "Audience is required."));
  }

  if (!hasObject(schema, "monetization")) {
    errors.push(createSchemaError("monetization", "Monetization is required."));
  }

  if (!hasObject(schema, "theme")) {
    errors.push(createSchemaError("theme", "Theme is required."));
  }
}

function validateScreens(schema: Record<string, unknown>, errors: EmovelSchemaValidationError[]) {
  if (!Array.isArray(schema.screens) || schema.screens.length === 0) {
    errors.push(createSchemaError("screens", "At least one screen is required."));
    return;
  }

  schema.screens.forEach((screen, index) => {
    const path = `screens[${index}]`;

    if (!isRecord(screen)) {
      errors.push(createSchemaError(path, "Screen must be an object."));
      return;
    }

    if (!hasNonEmptyArray(screen, "componentIds")) {
      errors.push(createSchemaError(`${path}.componentIds`, "Every screen must reference at least one component."));
    }
  });
}

function validateComponents(schema: Record<string, unknown>, errors: EmovelSchemaValidationError[]) {
  if (!Array.isArray(schema.components) || schema.components.length === 0) {
    errors.push(createSchemaError("components", "At least one component is required."));
    return;
  }

  schema.components.forEach((component, index) => {
    const path = `components[${index}]`;

    if (!isRecord(component)) {
      errors.push(createSchemaError(path, "Component must be an object."));
      return;
    }

    if (typeof component.type !== "string" || !COMPONENT_TYPES.includes(component.type as never)) {
      errors.push(createSchemaError(`${path}.type`, "Every component must have a supported type."));
    }

    if (!isRecord(component.props)) {
      errors.push(createSchemaError(`${path}.props`, "Every component must include props as an object."));
    }
  });
}

function validateExportTargets(schema: Record<string, unknown>, errors: EmovelSchemaValidationError[]) {
  if (!Array.isArray(schema.exportTargets) || schema.exportTargets.length === 0) {
    errors.push(createSchemaError("exportTargets", "Export targets are required."));
    return;
  }

  schema.exportTargets.forEach((exportTarget, index) => {
    if (!isRecord(exportTarget)) {
      errors.push(createSchemaError(`exportTargets[${index}]`, "Export target must be an object."));
      return;
    }

    if (typeof exportTarget.target !== "string" || !EXPORT_TARGETS.includes(exportTarget.target as never)) {
      errors.push(createSchemaError(`exportTargets[${index}].target`, "Export target must be supported."));
    }
  });
}

function validateQaChecklist(schema: Record<string, unknown>, errors: EmovelSchemaValidationError[]) {
  if (!hasNonEmptyArray(schema, "qaChecklist")) {
    errors.push(createSchemaError("qaChecklist", "QA checklist is required."));
  }
}

export function validateEmovelAppSchemaV0(value: unknown): EmovelAppSchemaValidationResultV0 {
  const errors: EmovelSchemaValidationError[] = [];
  const schema = validateTopLevelObject(value, errors);

  if (!schema) {
    return {
      valid: false,
      errors,
    };
  }

  validateRequiredObjects(schema, errors);
  validateScreens(schema, errors);
  validateComponents(schema, errors);
  validateExportTargets(schema, errors);
  validateQaChecklist(schema, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isEmovelGeneratedAppSchemaV0(value: unknown): value is EmovelGeneratedAppSchemaV0 {
  return validateEmovelAppSchemaV0(value).valid;
}
