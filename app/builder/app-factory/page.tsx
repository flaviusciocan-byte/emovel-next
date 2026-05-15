"use client";

import { useState } from "react";

interface GenerateSchemaResponse {
  success: boolean;
  result?: unknown;
  validation?: unknown;
  error?: string;
}

interface ValidationStatus {
  valid: boolean;
  errors: unknown[];
}

const defaultPrompt =
  "Create a premium EMOVEL product page for a founder-focused prompt system with a clear offer, Gumroad checkout intent, and a concise QA checklist.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getValidationStatus(value: unknown): ValidationStatus | null {
  if (!isRecord(value) || typeof value.valid !== "boolean" || !Array.isArray(value.errors)) {
    return null;
  }

  return {
    valid: value.valid,
    errors: value.errors,
  };
}

export default function AppFactoryPage() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [apiResponse, setApiResponse] = useState<GenerateSchemaResponse | null>(null);
  const [status, setStatus] = useState("Enter a product prompt and generate the internal schema.");
  const [copyStatus, setCopyStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const validationStatus = getValidationStatus(apiResponse?.validation);

  async function onGenerate() {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setStatus("Prompt is required before generation.");
      setApiResponse(null);
      return;
    }

    setIsGenerating(true);
    setCopyStatus("");
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

      setApiResponse(payload);
      setStatus("Schema generated with the deterministic internal adapter.");
    } catch (error) {
      setApiResponse(null);
      setStatus(error instanceof Error ? error.message : "Schema generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function onCopyJson() {
    if (!apiResponse) {
      return;
    }

    await navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    setCopyStatus("Copied");
  }

  function onDownloadJson() {
    if (!apiResponse) {
      return;
    }

    const blob = new Blob([JSON.stringify(apiResponse, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "emovel-app-factory-schema.json";
    link.click();
    URL.revokeObjectURL(url);
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

            {validationStatus ? (
              <div className="mt-5 border border-white/10 bg-white/[0.035] px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/60">
                Validation: {validationStatus.valid ? "valid" : "invalid"} · Errors:{" "}
                {validationStatus.errors.length}
              </div>
            ) : null}

            {apiResponse ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onCopyJson}
                  className="border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#c8a24a]/70 hover:text-[#c8a24a]"
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  onClick={onDownloadJson}
                  className="border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#c8a24a]/70 hover:text-[#c8a24a]"
                >
                  Download JSON
                </button>
                {copyStatus ? (
                  <span className="text-xs uppercase tracking-[0.16em] text-[#c8a24a]">
                    {copyStatus}
                  </span>
                ) : null}
              </div>
            ) : null}

            <pre className="mt-6 max-h-[640px] min-h-72 max-w-full overflow-auto border border-white/10 bg-[#050505] p-4 text-xs leading-6 text-white/60">
              {apiResponse
                ? JSON.stringify(apiResponse, null, 2)
                : "{\n  \"status\": \"Waiting for generation\"\n}"}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}
