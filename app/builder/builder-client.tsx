"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { buildOutputPlan } from "./output-planner";
import { resolveStyle } from "./style-resolver";
import { validateSpec } from "./spec-validator";
import type {
  BuilderSection,
  BuilderSpec,
  DesignDensity,
  ExportManifest,
  SectionType,
  StylePreset,
} from "./types";

const sectionTypes: SectionType[] = ["hero", "mechanism", "proof", "features", "cta", "faq"];
const stylePresets: StylePreset[] = ["premium-dark", "light-clean", "editorial-warm"];
const densityOptions: DesignDensity[] = ["focused", "premium", "dense"];

const initialSpec: BuilderSpec = {
  templateName: "b2b-consultant-landing",
  pageType: "landing_page",
  positioning: "Premium landing page for a B2B consultant with a controlled acquisition system.",
  targetAudience: "Founders and operators who need strategic clarity before scaling execution.",
  offer: "Strategic review, product architecture, and conversion system design.",
  stylePreset: "premium-dark",
  designDensity: "premium",
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Turn scattered execution into a controlled system.",
      objective: "Establish the promise, audience, and commercial outcome in the first viewport.",
    },
    {
      id: "mechanism",
      type: "mechanism",
      title: "Define the operating mechanism.",
      objective: "Explain how the offer converts raw ideas into structured assets and decisions.",
    },
    {
      id: "proof",
      type: "proof",
      title: "Show why the system is credible.",
      objective: "Connect positioning, process, and delivery logic into proof the buyer can evaluate.",
    },
    {
      id: "cta",
      type: "cta",
      title: "Move qualified buyers into the system.",
      objective: "Create a direct conversion point without fake publishing or route navigation.",
    },
  ],
};

function textFieldClass() {
  return "w-full border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-white/35";
}

function selectFieldClass() {
  return "w-full border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-white/35";
}

function labelClass() {
  return "text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/45";
}

function formatLabel(value: string) {
  return value
    .split(/[_-]/g)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function createSection(): BuilderSection {
  return {
    id: `section-${Date.now().toString(36)}`,
    type: "features",
    title: "New system layer",
    objective: "Define the role this section plays in the conversion path.",
  };
}

function createManifest(spec: BuilderSpec): ExportManifest {
  const validation = validateSpec(spec);
  const outputPlan = buildOutputPlan(spec);
  const style = resolveStyle(spec);

  return {
    generatedAt: new Date().toISOString(),
    spec,
    validation,
    outputPlan,
    style,
  };
}

function PreviewSection({
  section,
  style,
}: {
  section: BuilderSection;
  style: ReturnType<typeof resolveStyle>;
}) {
  return (
    <section className="border-t px-6 py-8" style={{ borderColor: style.border }}>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em]" style={{ color: style.accent }}>
        {formatLabel(section.type)}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: style.text }}>
        {section.title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: style.muted }}>
        {section.objective}
      </p>
    </section>
  );
}

export default function BuilderClient() {
  const [spec, setSpec] = useState<BuilderSpec>(initialSpec);
  const [manifestStatus, setManifestStatus] = useState("Ready for browser export");

  const validation = useMemo(() => validateSpec(spec), [spec]);
  const outputPlan = useMemo(() => buildOutputPlan(spec), [spec]);
  const style = useMemo(() => resolveStyle(spec), [spec]);
  const manifestPreview = useMemo<ExportManifest>(
    () => ({
      generatedAt: "browser-export",
      spec,
      validation,
      outputPlan,
      style,
    }),
    [outputPlan, spec, style, validation],
  );

  const previewStyle: CSSProperties = {
    backgroundColor: style.background,
    color: style.text,
    borderColor: style.border,
  };

  function updateSpecField<K extends keyof Omit<BuilderSpec, "sections">>(
    key: K,
    value: BuilderSpec[K],
  ) {
    setSpec((current) => ({ ...current, [key]: value }));
  }

  function updateSection(index: number, field: keyof BuilderSection, value: string) {
    setSpec((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }));
  }

  function addSection() {
    setSpec((current) => ({ ...current, sections: [...current.sections, createSection()] }));
  }

  function removeSection(index: number) {
    setSpec((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  }

  async function copyManifest() {
    const manifest = JSON.stringify(createManifest(spec), null, 2);
    await navigator.clipboard.writeText(manifest);
    setManifestStatus("Manifest copied to clipboard");
  }

  function downloadManifest() {
    const manifest = JSON.stringify(createManifest(spec), null, 2);
    const blob = new Blob([manifest], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${outputPlan.templateName}-manifest.json`;
    link.click();
    URL.revokeObjectURL(url);
    setManifestStatus("Manifest downloaded locally");
  }

  return (
    <section
      id="builder-workspace"
      className="mx-auto w-full max-w-7xl scroll-mt-32 px-6 pb-28 pt-20 lg:px-10"
    >
      <div className="mb-10 max-w-3xl">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/45">
          SPEC BUILDER
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Build from a structured brief.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/55">
          Compose the product specification first, then review readiness, planned output, preview, and export manifest in one controlled pipeline.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
        <div className="space-y-5">
          <div className="border border-white/10 bg-white/[0.035] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={labelClass()}>Spec Composer</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Product system input</h3>
              </div>
              <div className="min-w-24 border border-white/10 bg-black/30 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-white">{validation.readinessScore}</p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Ready</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass()}>Template Name</span>
                <input
                  className={textFieldClass()}
                  value={spec.templateName}
                  onChange={(event) => updateSpecField("templateName", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass()}>Page Type</span>
                <input
                  className={textFieldClass()}
                  value={spec.pageType}
                  onChange={(event) => updateSpecField("pageType", event.target.value)}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className={labelClass()}>Positioning</span>
                <textarea
                  className={`${textFieldClass()} min-h-28 resize-none leading-7`}
                  value={spec.positioning}
                  onChange={(event) => updateSpecField("positioning", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass()}>Target Audience</span>
                <textarea
                  className={`${textFieldClass()} min-h-24 resize-none leading-7`}
                  value={spec.targetAudience}
                  onChange={(event) => updateSpecField("targetAudience", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass()}>Offer</span>
                <textarea
                  className={`${textFieldClass()} min-h-24 resize-none leading-7`}
                  value={spec.offer}
                  onChange={(event) => updateSpecField("offer", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass()}>Style Preset</span>
                <select
                  className={selectFieldClass()}
                  value={spec.stylePreset}
                  onChange={(event) => updateSpecField("stylePreset", event.target.value as StylePreset)}
                >
                  {stylePresets.map((preset) => (
                    <option key={preset} value={preset}>
                      {formatLabel(preset)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClass()}>Design Density</span>
                <select
                  className={selectFieldClass()}
                  value={spec.designDensity}
                  onChange={(event) => updateSpecField("designDensity", event.target.value as DesignDensity)}
                >
                  {densityOptions.map((density) => (
                    <option key={density} value={density}>
                      {formatLabel(density)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={labelClass()}>Sections</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Conversion path</h3>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/35"
              >
                Add Section
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {spec.sections.map((section, index) => (
                <div key={`${section.id}-${index}`} className="border border-white/10 bg-black/25 p-4">
                  <div className="grid gap-3 md:grid-cols-[0.9fr_0.8fr_1.3fr]">
                    <label className="space-y-2">
                      <span className={labelClass()}>ID</span>
                      <input
                        className={textFieldClass()}
                        value={section.id}
                        onChange={(event) => updateSection(index, "id", event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className={labelClass()}>Type</span>
                      <select
                        className={selectFieldClass()}
                        value={section.type}
                        onChange={(event) => updateSection(index, "type", event.target.value as SectionType)}
                      >
                        {sectionTypes.map((type) => (
                          <option key={type} value={type}>
                            {formatLabel(type)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className={labelClass()}>Title</span>
                      <input
                        className={textFieldClass()}
                        value={section.title}
                        onChange={(event) => updateSection(index, "title", event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="mt-3 block space-y-2">
                    <span className={labelClass()}>Objective</span>
                    <textarea
                      className={`${textFieldClass()} min-h-20 resize-none leading-7`}
                      value={section.objective}
                      onChange={(event) => updateSection(index, "objective", event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="border border-white/10 bg-white/[0.035] p-6">
              <p className={labelClass()}>Validation</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {validation.isReady ? "Spec ready for planning." : "Spec needs completion."}
              </h3>
              <div className="mt-5 h-2 bg-white/10">
                <div
                  className="h-full bg-white"
                  style={{ width: `${validation.readinessScore}%` }}
                />
              </div>
              <div className="mt-5 space-y-2 text-sm leading-6 text-white/55">
                {[...validation.missingFields, ...validation.sectionIssues].length === 0 ? (
                  <p>No missing fields detected.</p>
                ) : (
                  [...validation.missingFields, ...validation.sectionIssues].map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))
                )}
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.035] p-6">
              <p className={labelClass()}>Export Manifest</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Browser-only handoff</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Manifest export generates JSON in the browser. It does not write server files, run builds, or create zip archives.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={copyManifest}
                  className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/35"
                >
                  Copy Manifest
                </button>
                <button
                  type="button"
                  onClick={downloadManifest}
                  className="bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/85"
                >
                  Download JSON
                </button>
              </div>
              <p className="mt-4 text-xs text-white/45">{manifestStatus}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border border-white/10 bg-white/[0.035] p-6">
            <p className={labelClass()}>Output Plan</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{outputPlan.outputPath}</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <PlanList title="Folders" items={outputPlan.folders} />
              <PlanList title="Files" items={outputPlan.files} />
              <PlanList title="Components" items={outputPlan.components} />
              <PlanList title="Export Assets" items={outputPlan.exportAssets} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={labelClass()}>Preview</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Generated product surface</h3>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                {formatLabel(spec.stylePreset)}
              </p>
            </div>

            <div className="mt-6 overflow-hidden border" style={previewStyle}>
              <section className="px-6 py-12" style={{ backgroundColor: style.surface }}>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em]" style={{ color: style.accent }}>
                  {spec.templateName}
                </p>
                <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight" style={{ color: style.text }}>
                  {spec.sections[0]?.title || spec.positioning}
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7" style={{ color: style.muted }}>
                  {spec.positioning}
                </p>
                <div
                  className="mt-8 inline-flex border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ borderColor: style.accent, color: style.accent }}
                >
                  Preview CTA
                </div>
              </section>

              <section className="px-6 py-8" style={{ backgroundColor: style.background }}>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em]" style={{ color: style.accent }}>
                  Audience
                </p>
                <p className="mt-3 text-sm leading-7" style={{ color: style.muted }}>
                  {spec.targetAudience}
                </p>
                <p className="mt-5 text-sm leading-7" style={{ color: style.text }}>
                  {spec.offer}
                </p>
              </section>

              {spec.sections.slice(1).map((section, index) => (
                <PreviewSection key={`${section.id}-${index}`} section={section} style={style} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-6">
            <p className={labelClass()}>Manifest Preview</p>
            <pre className="mt-5 max-h-80 overflow-auto bg-black/35 p-4 text-xs leading-6 text-white/55">
              {JSON.stringify(manifestPreview, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-white/10 bg-black/25 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">{title}</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <p key={item} className="break-words text-sm leading-6 text-white/60">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
