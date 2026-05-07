import type { AiModelConfig } from "./model-registry";

export interface AiStreamUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface AiStreamResult {
  text: AsyncGenerator<string>;
  usage: AiStreamUsage;
}

export interface AiPromptMessage {
  role: "system" | "user";
  content: string;
}

function parseSseLines(buffer: string) {
  const lines = buffer.split("\n");
  return {
    complete: lines.slice(0, -1),
    rest: lines[lines.length - 1] || "",
  };
}

function createErrorMessage(provider: string, response: Response) {
  return `${provider} generation failed: ${response.status} ${response.statusText}`;
}

async function* streamOpenAi(config: AiModelConfig, messages: AiPromptMessage[], usage: AiStreamUsage) {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("OpenAI provider is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(createErrorMessage("OpenAI", response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseLines(buffer);
    buffer = parsed.rest;

    for (const line of parsed.complete) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        continue;
      }

      const payload = trimmed.slice("data:".length).trim();

      if (payload === "[DONE]") {
        continue;
      }

      try {
        const event = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
          };
        };
        const content = event.choices?.[0]?.delta?.content;

        if (event.usage) {
          usage.promptTokens = event.usage.prompt_tokens || usage.promptTokens;
          usage.completionTokens = event.usage.completion_tokens || usage.completionTokens;
        }

        if (content) {
          yield content;
        }
      } catch {
        continue;
      }
    }
  }
}

async function* streamAnthropic(config: AiModelConfig, messages: AiPromptMessage[], usage: AiStreamUsage) {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error("Anthropic provider is not configured.");
  }

  const system = messages.find((message) => message.role === "system")?.content || "";
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => ({ role: "user", content: message.content }));
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      system,
      messages: userMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(createErrorMessage("Anthropic", response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseLines(buffer);
    buffer = parsed.rest;

    for (const line of parsed.complete) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        continue;
      }

      try {
        const event = JSON.parse(trimmed.slice("data:".length).trim()) as {
          type?: string;
          delta?: { text?: string };
          usage?: { input_tokens?: number; output_tokens?: number };
        };

        if (event.usage) {
          usage.promptTokens = event.usage.input_tokens || usage.promptTokens;
          usage.completionTokens = event.usage.output_tokens || usage.completionTokens;
        }

        if (event.type === "content_block_delta" && event.delta?.text) {
          yield event.delta.text;
        }
      } catch {
        continue;
      }
    }
  }
}

export function streamAiText(config: AiModelConfig, messages: AiPromptMessage[]): AiStreamResult {
  const usage = {
    promptTokens: 0,
    completionTokens: 0,
  };

  return {
    usage,
    text: config.provider === "openai"
      ? streamOpenAi(config, messages, usage)
      : streamAnthropic(config, messages, usage),
  };
}
