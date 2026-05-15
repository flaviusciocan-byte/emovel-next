import { createAppSchemaFromPromptV0 } from "../compiler/prompt-to-schema";
import type {
  EmovelAppFactoryAIAdapterInputV0,
  EmovelAppFactoryAIAdapterResultV0,
} from "./ai-adapter-types";

export function createAppFactorySchemaWithAIAdapterV0(
  input: EmovelAppFactoryAIAdapterInputV0,
): EmovelAppFactoryAIAdapterResultV0 {
  const schema = createAppSchemaFromPromptV0(input);

  return {
    schema,
    metadata: {
      mode: "deterministic-placeholder",
      generatedAt: new Date().toISOString(),
      warnings: [
        "AI adapter is not connected to an external model yet.",
        "Schema was generated with the deterministic EMOVEL compiler fallback.",
      ],
    },
  };
}
