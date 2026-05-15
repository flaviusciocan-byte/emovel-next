"use client";

import { useState } from "react";
import { EMOVEL_THEME_PACKS_V0 } from "../../../lib/emovel/themes/theme-packs";

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

interface SchemaSummary {
  projectName: string;
  category: string;
  screenCount: number;
  componentCount: number;
}

interface SchemaPreview {
  hero: {
    eyebrow: string;
    headline: string;
    ctaLabel: string;
  };
  offer: {
    title: string;
    priceAnchor: string;
  };
  theme: {
    packId: string;
    archetypeId: string;
    accent: string;
  };
  checkoutTarget: string;
}

interface PromptQuality {
  status: "Weak" | "Good" | "Premium";
  notes: string[];
}

const defaultPrompt =
  "Create a premium EMOVEL product page for a founder-focused prompt system with a clear offer, Gumroad checkout intent, and a concise QA checklist.";

const promptPresets = [
  {
    label: "Premium prompt pack product page",
    prompt:
      "Create a premium product page for an EMOVEL prompt pack, targeting founders who need repeatable AI workflows, with a clear offer, Gumroad checkout intent, proof sections, and QA checklist.",
  },
  {
    label: "Creator dashboard app",
    prompt:
      "Create a creator dashboard app for managing content ideas, product assets, publishing priorities, audience segments, and monetization actions in a premium dark EMOVEL interface.",
  },
  {
    label: "Digital template shop",
    prompt:
      "Create a digital template shop for selling premium Notion, prompt, and business system templates, with product categories, offer cards, checkout intent, and export-ready schema structure.",
  },
  {
    label: "Founder authority landing page",
    prompt:
      "Create a founder authority landing page that positions a premium expert offer, explains the mechanism, captures qualified leads, and supports a strong commercial CTA.",
  },
  {
    label: "Mobile app blueprint",
    prompt:
      "Create a mobile app blueprint for a premium productivity product, including audience, monetization, screen map, component map, theme pack, actions, data model, and QA checklist.",
  },
] as const;

const premiumPromptIdeas = [
  "offer",
  "audience",
  "checkout",
  "dashboard",
  "mobile",
  "validation",
  "components",
  "theme",
  "gumroad",
  "product",
  "landing page",
] as const;

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

function getSchemaSummary(value: GenerateSchemaResponse | null): SchemaSummary | null {
  if (!value || !isRecord(value.result)) {
    return null;
  }

  const schema = value.result.schema;

  if (!isRecord(schema)) {
    return null;
  }

  const project = isRecord(schema.project) ? schema.project : {};
  const screens = Array.isArray(schema.screens) ? schema.screens : [];
  const components = Array.isArray(schema.components) ? schema.components : [];

  return {
    projectName: typeof project.name === "string" && project.name.trim() ? project.name : "Untitled",
    category: typeof project.category === "string" && project.category.trim() ? project.category : "unknown",
    screenCount: screens.length,
    componentCount: components.length,
  };
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readComponentProp(component: Record<string, unknown> | undefined, key: string, fallback: string) {
  const props = isRecord(component?.props) ? component.props : {};

  return readString(props[key], fallback);
}

function getSchemaPreview(value: GenerateSchemaResponse | null): SchemaPreview | null {
  if (!value || !isRecord(value.result)) {
    return null;
  }

  const schema = value.result.schema;

  if (!isRecord(schema)) {
    return null;
  }

  const components = Array.isArray(schema.components) ? schema.components : [];
  const heroComponent = components.find(
    (component): component is Record<string, unknown> =>
      isRecord(component) && component.type === "hero",
  );
  const pricingComponent = components.find(
    (component): component is Record<string, unknown> =>
      isRecord(component) && component.type === "pricing-block",
  );
  const theme = isRecord(schema.theme) ? schema.theme : {};
  const tokens = isRecord(theme.tokens) ? theme.tokens : {};
  const actions = Array.isArray(schema.actions) ? schema.actions : [];
  const checkoutAction = actions.find(
    (action): action is Record<string, unknown> =>
      isRecord(action) && action.type === "checkout",
  );

  return {
    hero: {
      eyebrow: readComponentProp(heroComponent, "eyebrow", "EMOVEL App Factory"),
      headline: readComponentProp(heroComponent, "headline", "Generated product system"),
      ctaLabel: readComponentProp(heroComponent, "ctaLabel", "Start"),
    },
    offer: {
      title: readComponentProp(pricingComponent, "title", "Primary Offer"),
      priceAnchor: readComponentProp(pricingComponent, "priceAnchor", "TBD"),
    },
    theme: {
      packId: readString(theme.packId, "Unknown theme pack"),
      archetypeId: readString(theme.archetypeId, "Unknown archetype"),
      accent: readString(tokens.accent, "#c8a24a"),
    },
    checkoutTarget: readString(checkoutAction?.target, "No checkout target declared"),
  };
}

function getPromptQuality(value: string): PromptQuality {
  const normalized = value.trim();
  const lowered = normalized.toLowerCase();
  const matchedIdeas = premiumPromptIdeas.filter((idea) => lowered.includes(idea));

  if (normalized.length < 40) {
    return {
      status: "Weak",
      notes: [
        "Add more context about the product and audience.",
        "Include offer, screen, or monetization details before generating.",
      ],
    };
  }

  if (matchedIdeas.length >= 3) {
    return {
      status: "Premium",
      notes: [
        `Strong prompt coverage: ${matchedIdeas.slice(0, 3).join(", ")}.`,
        "Ready for a more useful schema pass.",
      ],
    };
  }

  return {
    status: "Good",
    notes: [
      "Prompt length is strong enough for generation.",
      "Add more specifics like offer, audience, checkout, components, or theme to reach Premium.",
    ],
  };
}

function createImprovedPrompt(value: string) {
  const normalized = value.trim();

  return [
    `Create a premium EMOVEL app schema from this product idea: "${normalized}".`,
    "Define a clear commercial offer, target audience, checkout intent, component map, EMOVEL black-and-gold theme direction, and validation requirements.",
    "Include project info, screens, components, monetization, actions, data model, export targets, and QA checklist.",
  ].join(" ");
}

export default function AppFactoryPage() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [apiResponse, setApiResponse] = useState<GenerateSchemaResponse | null>(null);
  const [status, setStatus] = useState("Enter a product prompt and generate the internal schema.");
  const [copyStatus, setCopyStatus] = useState("");
  const [previewCheckoutMessage, setPreviewCheckoutMessage] = useState("");
  const [selectedThemePackId, setSelectedThemePackId] = useState(
    EMOVEL_THEME_PACKS_V0[0]?.packId ?? "emovel-black-gold",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const validationStatus = getValidationStatus(apiResponse?.validation);
  const schemaSummary = getSchemaSummary(apiResponse);
  const schemaPreview = getSchemaPreview(apiResponse);
  const promptQuality = getPromptQuality(prompt);
  const selectedThemePack =
    EMOVEL_THEME_PACKS_V0.find((themePack) => themePack.packId === selectedThemePackId) ??
    EMOVEL_THEME_PACKS_V0[0];

  async function onGenerate() {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setStatus("Prompt is required before generation.");
      setApiResponse(null);
      return;
    }

    setIsGenerating(true);
    setCopyStatus("");
    setPreviewCheckoutMessage("");
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

  function onClear() {
    setPrompt("");
    setApiResponse(null);
    setCopyStatus("");
    setPreviewCheckoutMessage("");
    setStatus("Enter a product prompt and generate the internal schema.");
  }

  function onImprovePrompt() {
    if (!prompt.trim() || promptQuality.status === "Premium") {
      return;
    }

    setPrompt(createImprovedPrompt(prompt));
  }

  function onPreviewStart() {
    setPreviewCheckoutMessage(
      `Checkout intent: ${schemaPreview?.checkoutTarget ?? "No checkout target declared"}`,
    );
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
              <div className="mt-4 flex flex-wrap gap-2">
                {promptPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPrompt(preset.prompt)}
                    className="border border-white/10 bg-black/25 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:border-[#c8a24a]/60 hover:text-[#c8a24a]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="mt-4 min-h-72 w-full resize-none border border-white/10 bg-black/35 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#c8a24a]/70"
                placeholder="Describe the app, audience, offer, screens, and commercial intent."
              />
            </label>

            <div className="mt-4 border border-white/10 bg-black/25 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Prompt Quality Notes
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c8a24a]">
                    {promptQuality.status}
                  </span>
                  {prompt ? (
                    <button
                      type="button"
                      onClick={onImprovePrompt}
                      className="border border-white/15 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#c8a24a]/70 hover:text-[#c8a24a]"
                    >
                      Improve Prompt
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-6 text-white/55">
                {promptQuality.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>

            <div className="mt-4 border border-white/10 bg-black/25 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Theme Selector
                </p>
                <span className="text-xs uppercase tracking-[0.16em] text-[#c8a24a]">
                  {selectedThemePack?.label ?? "EMOVEL Theme"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {EMOVEL_THEME_PACKS_V0.map((themePack) => {
                  const selected = themePack.packId === selectedThemePackId;

                  return (
                    <button
                      key={themePack.packId}
                      type="button"
                      onClick={() => setSelectedThemePackId(themePack.packId)}
                      className={`border px-3 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition ${
                        selected
                          ? "border-[#c8a24a]/70 bg-white/[0.08] text-[#c8a24a]"
                          : "border-white/10 bg-black/25 text-white/50 hover:border-[#c8a24a]/60 hover:text-[#c8a24a]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 border border-white/20"
                          style={{ backgroundColor: themePack.tokens.accent }}
                        />
                        {themePack.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="inline-flex h-12 items-center justify-center bg-white px-6 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
                >
                  {isGenerating ? "Generating" : "Generate"}
                </button>
                {prompt || apiResponse ? (
                  <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex h-12 items-center justify-center border border-white/15 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#c8a24a]/70 hover:text-[#c8a24a]"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
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

            {apiResponse ? (
              <div className="mt-5 grid gap-3 border border-white/10 bg-white/[0.035] p-4 text-sm text-white/65 sm:grid-cols-2">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Project
                  </p>
                  <p className="mt-2 text-white">{schemaSummary?.projectName ?? "Unavailable"}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Category
                  </p>
                  <p className="mt-2 text-white">{schemaSummary?.category ?? "Unavailable"}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Screens
                  </p>
                  <p className="mt-2 text-white">{schemaSummary?.screenCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Components
                  </p>
                  <p className="mt-2 text-white">{schemaSummary?.componentCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Validation
                  </p>
                  <p className="mt-2 text-white">
                    {validationStatus ? (validationStatus.valid ? "valid" : "invalid") : "unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Errors
                  </p>
                  <p className="mt-2 text-white">{validationStatus?.errors.length ?? 0}</p>
                </div>
              </div>
            ) : null}

            {apiResponse ? (
              <div className="mt-5 border border-white/10 bg-black/25 p-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Schema Preview
                </p>
                <div className="mt-4 grid gap-4">
                  <div
                    className="border p-4"
                    style={{
                      backgroundColor: selectedThemePack?.tokens.background ?? "#050505",
                      borderColor: selectedThemePack?.tokens.border ?? "rgba(255,255,255,0.1)",
                    }}
                  >
                    <p
                      className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: selectedThemePack?.tokens.accent ?? "#c8a24a" }}
                    >
                      {schemaPreview?.hero.eyebrow ?? "EMOVEL App Factory"}
                    </p>
                    <h3
                      className="mt-3 text-2xl font-semibold tracking-tight"
                      style={{ color: selectedThemePack?.tokens.text ?? "#ffffff" }}
                    >
                      {schemaPreview?.hero.headline ?? "Generated product system"}
                    </h3>
                    <button
                      type="button"
                      onClick={onPreviewStart}
                      className="mt-5 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{
                        borderColor: selectedThemePack?.tokens.border ?? "rgba(255,255,255,0.15)",
                        color: selectedThemePack?.tokens.text ?? "#ffffff",
                      }}
                    >
                      {schemaPreview?.hero.ctaLabel ?? "Start"}
                    </button>
                    {previewCheckoutMessage ? (
                      <p
                        className="mt-3 text-xs leading-6"
                        style={{ color: selectedThemePack?.tokens.accent ?? "#c8a24a" }}
                      >
                        {previewCheckoutMessage}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                        Offer
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {schemaPreview?.offer.title ?? "Primary Offer"}
                      </p>
                      <p className="mt-2 text-sm text-[#c8a24a]">
                        {schemaPreview?.offer.priceAnchor ?? "TBD"}
                      </p>
                    </div>

                    <div className="border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                        Theme
                      </p>
                      <p className="mt-3 text-sm text-white">
                        {selectedThemePack?.packId ?? schemaPreview?.theme.packId ?? "Unknown theme pack"}
                      </p>
                      <p className="mt-2 text-xs text-white/50">
                        {selectedThemePack?.archetypeId ??
                          schemaPreview?.theme.archetypeId ??
                          "Unknown archetype"}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span
                          className="h-5 w-5 border border-white/20"
                          style={{
                            backgroundColor:
                              selectedThemePack?.tokens.accent ??
                              schemaPreview?.theme.accent ??
                              "#c8a24a",
                          }}
                        />
                        <span className="text-xs uppercase tracking-[0.16em] text-white/45">
                          Accent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
