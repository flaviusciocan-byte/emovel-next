"use client";

import { useState } from "react";

interface GenerateSchemaResponse {
  success: boolean;
  result?: unknown;
  error?: string;
}

const defaultPrompt =
  "Create a premium EMOVEL product page for a founder-focused prompt system with a clear offer, Gumroad checkout intent, and a concise QA checklist.";

export default function AppFactoryPage() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [result, setResult] = useState<unknown>(null);
  const [status, setStatus] = useState("Enter a product prompt and generate the internal schema.");
  const [isGenerating, setIsGenerating] = useState(false);

  async function onGenerate() {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setStatus("Prompt is required before generation.");
      setResult(null);
      return;
    }

    setIsGenerating(true);
    setStatus("Generating deterministic App Factory schema...");

    try {
      const response = await fetch("/api/builder/app-factory/generate-schema", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt: normalizedPrompt,
        }),
      });
      const payload = (await response.json()) as GenerateSchemaResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Schema generation failed.");
      }

      setResult(payload.result);
      setStatus("Schema generated with the deterministic internal adapter.");
    } catch (error) {
      setResult(null);
      setStatus(error instanceof Error ? error.message : "Schema generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#030405] px-6 py-24 text-white sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.42em] text-[#c8a24a]">
            EMOVEL APP FACTORY
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Generate an internal app schema.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Prompt to product brief, screen map, component map, theme pack, export targets, and QA.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <label className="block">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/45">
                Product Prompt
              </span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="mt-4 min-h-72 w-full resize-none border border-white/10 bg-black/35 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#c8a24a]/70"
                placeholder="Describe the app, audience, offer, screens, and commercial intent."
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="inline-flex h-12 items-center justify-center bg-white px-6 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
              >
                {isGenerating ? "Generating" : "Generate"}
              </button>
              <p className="text-xs leading-6 text-white/45">{status}</p>
            </div>
          </section>

          <section className="min-w-0 border border-white/10 bg-black/35 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/45">
                  JSON Result
                </p>
                <h2 className="mt-3 text-xl font-semibold text-white">Generated schema output</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#c8a24a]">
                deterministic
              </span>
            </div>

            <pre className="mt-6 max-h-[640px] min-h-72 max-w-full overflow-auto border border-white/10 bg-[#050505] p-4 text-xs leading-6 text-white/60">
              {result
                ? JSON.stringify(result, null, 2)
                : "{\n  \"status\": \"Waiting for generation\"\n}"}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}
