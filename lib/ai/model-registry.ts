export type AiProvider = "openai" | "anthropic";

export interface AiModelConfig {
  provider: AiProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  cost: {
    inputCentsPerMillionTokens: number;
    outputCentsPerMillionTokens: number;
  };
}

export interface AiModelRegistry {
  primary: AiModelConfig | null;
  fallback: AiModelConfig | null;
}

function parseProvider(value: string | undefined): AiProvider | null {
  if (value === "openai" || value === "anthropic") {
    return value;
  }

  return null;
}

function readNumber(name: string, fallback: number) {
  const value = process.env[name];
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

function readModelConfig(prefix: "PRIMARY" | "FALLBACK"): AiModelConfig | null {
  const provider = parseProvider(process.env[`AI_${prefix}_PROVIDER`]);
  const model = process.env[`AI_${prefix}_MODEL`];

  if (!provider || !model) {
    return null;
  }

  return {
    provider,
    model,
    maxTokens: readNumber(`AI_${prefix}_MAX_TOKENS`, readNumber("AI_MAX_TOKENS", 2200)),
    temperature: readNumber(`AI_${prefix}_TEMPERATURE`, readNumber("AI_TEMPERATURE", 0.35)),
    cost: {
      inputCentsPerMillionTokens: readNumber(`AI_${prefix}_INPUT_CENTS_PER_1M`, 0),
      outputCentsPerMillionTokens: readNumber(`AI_${prefix}_OUTPUT_CENTS_PER_1M`, 0),
    },
  };
}

export function getAiModelRegistry(): AiModelRegistry {
  return {
    primary: readModelConfig("PRIMARY"),
    fallback: readModelConfig("FALLBACK"),
  };
}

export function hasProviderKey(provider: AiProvider) {
  if (provider === "openai") {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  if (provider === "anthropic") {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  return false;
}

export function getAvailableModelSequence() {
  const registry = getAiModelRegistry();

  return [registry.primary, registry.fallback].filter(
    (config): config is AiModelConfig => {
      if (!config) {
        return false;
      }

      return hasProviderKey(config.provider);
    },
  );
}

export function estimateCostCents(
  config: AiModelConfig,
  promptTokens: number,
  completionTokens: number,
) {
  return Math.ceil(
    (promptTokens / 1_000_000) * config.cost.inputCentsPerMillionTokens +
      (completionTokens / 1_000_000) * config.cost.outputCentsPerMillionTokens,
  );
}
