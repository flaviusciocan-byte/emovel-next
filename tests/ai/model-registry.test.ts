import { readFileSync } from "node:fs";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getAiModelRegistry, getAvailableModelSequence } from "../../lib/ai/model-registry";

const originalEnv = process.env;
const aiEnvKeys = [
  "AI_PRIMARY_PROVIDER",
  "AI_PRIMARY_MODEL",
  "AI_PRIMARY_MAX_TOKENS",
  "AI_PRIMARY_TEMPERATURE",
  "AI_PRIMARY_INPUT_CENTS_PER_1M",
  "AI_PRIMARY_OUTPUT_CENTS_PER_1M",
  "AI_FALLBACK_PROVIDER",
  "AI_FALLBACK_MODEL",
  "AI_MAX_TOKENS",
  "AI_TEMPERATURE",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
];

describe("AI model registry", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };

    aiEnvKeys.forEach((key) => {
      delete process.env[key];
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("fails safely when provider or model config is missing", () => {
    const registry = getAiModelRegistry();

    expect(registry.primary).toBeNull();
    expect(registry.fallback).toBeNull();
    expect(getAvailableModelSequence()).toEqual([]);
  });

  it("builds primary config from environment variables", () => {
    process.env.AI_PRIMARY_PROVIDER = "openai";
    process.env.AI_PRIMARY_MODEL = "env-primary-model";
    process.env.AI_PRIMARY_MAX_TOKENS = "1600";
    process.env.AI_PRIMARY_TEMPERATURE = "0.25";
    process.env.AI_PRIMARY_INPUT_CENTS_PER_1M = "12";
    process.env.AI_PRIMARY_OUTPUT_CENTS_PER_1M = "60";
    process.env.OPENAI_API_KEY = "test-key";

    const registry = getAiModelRegistry();

    expect(registry.primary).toEqual({
      provider: "openai",
      model: "env-primary-model",
      maxTokens: 1600,
      temperature: 0.25,
      cost: {
        inputCentsPerMillionTokens: 12,
        outputCentsPerMillionTokens: 60,
      },
    });
    expect(getAvailableModelSequence()).toHaveLength(1);
  });

  it("excludes configured providers when their server key is missing", () => {
    process.env.AI_PRIMARY_PROVIDER = "anthropic";
    process.env.AI_PRIMARY_MODEL = "env-anthropic-model";

    expect(getAiModelRegistry().primary?.model).toBe("env-anthropic-model");
    expect(getAvailableModelSequence()).toEqual([]);
  });

  it("keeps concrete model IDs out of the route handler", () => {
    const routeSource = readFileSync("app/api/ai/generate/route.ts", "utf8");

    expect(routeSource).toContain("getAvailableModelSequence");
    expect(routeSource).not.toMatch(/\b(gpt-|claude-|sonnet|haiku|opus)\b/i);
  });
});
