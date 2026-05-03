"use client";

import { useMemo, useState } from "react";
import {
  AddCreditsModal,
  CreditDisplay,
  InsufficientCredits,
  useAddCreditsModal,
} from "../credits/credit-ui";
import { useCredits } from "../credits/credit-store";
import RuntimePreview from "../runtime/runtime-preview";
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

const defaultBrief =
  "A premium B2B landing page for a consultant who helps founders turn scattered execution into a controlled product system.";

const initialSpec: BuilderSpec = createSpecFromBrief(defaultBrief);

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

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42) || "emovel-system"
  );
}

function summarizeBrief(brief: string) {
  const normalized = brief.trim().replace(/\s+/g, " ");
  return normalized.length > 150 ? `${normalized.slice(0, 147)}...` : normalized;
}

function createSpecFromBrief(brief: string): BuilderSpec {
  const summary = summarizeBrief(brief) || summarizeBrief(defaultBrief);
  const templateName = slugify(summary);

  return {
    templateName,
    pageType: "landing_page",
    positioning: summary,
    targetAudience:
      "Decision-makers who need a clearer system, stronger commercial logic, and a controlled path from idea to execution.",
    offer:
      "A structured digital product system that connects positioning, sections, proof, and conversion into one launch-ready asset.",
    stylePreset: "premium-dark",
    designDensity: "premium",
    sections: [
      {
        id: "hero",
        type: "hero",
        title: "Turn the brief into a controlled product system.",
        objective: `Establish the core promise and commercial direction: ${summary}`,
      },
      {
        id: "mechanism",
        type: "mechanism",
        title: "Define the execution mechanism.",
        objective:
          "Explain how the system moves from raw direction to structured page logic, offer clarity, and production assets.",
      },
      {
        id: "proof",
        type: "proof",
        title: "Make the value legible.",
        objective:
          "Show why the structure is credible by connecting audience, outcome, workflow, and conversion path.",
      },
      {
        id: "cta",
        type: "cta",
        title: "Move the user into the system.",
        objective:
          "Create a clear next step without fake publishing, fake checkout, or unsupported claims.",
      },
    ],
  };
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

export default function BuilderClient() {
  const { credits, costs, canAfford, spendCredits } = useCredits();
  const addCreditsModal = useAddCreditsModal();
  const [systemBrief, setSystemBrief] = useState(defaultBrief);
  const [spec, setSpec] = useState<BuilderSpec>(initialSpec);
  const [manifestStatus, setManifestStatus] = useState("Generate a system before exporting.");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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

  function markDirty() {
    setManifestStatus("Generate the system again before exporting.");
  }

  function updateSpecField<K extends keyof Omit<BuilderSpec, "sections">>(
    key: K,
    value: BuilderSpec[K],
  ) {
    markDirty();
    setSpec((current) => ({ ...current, [key]: value }));
  }

  function updateSection(index: number, field: keyof BuilderSection, value: string) {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }));
  }

  function addSection() {
    markDirty();
    setSpec((current) => ({ ...current, sections: [...current.sections, createSection()] }));
  }

  function removeSection(index: number) {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  }

  async function copyManifest() {
    if (!hasGenerated) {
      setManifestStatus("Generate the system before exporting.");
      return;
    }

    const manifest = JSON.stringify(createManifest(spec), null, 2);
    await navigator.clipboard.writeText(manifest);
    setManifestStatus("Manifest copied to clipboard.");
  }

  function downloadManifest() {
    if (!hasGenerated) {
      setManifestStatus("Generate the system before exporting.");
      return;
    }

    const manifest = JSON.stringify(createManifest(spec), null, 2);
    const blob = new Blob([manifest], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${outputPlan.templateName}-manifest.json`;
    link.click();
    URL.revokeObjectURL(url);
    setManifestStatus("Manifest downloaded locally.");
  }

  function generateSystem() {
    if (!systemBrief.trim()) {
      setManifestStatus("Add a system brief before generating.");
      return;
    }

    if (!spendCredits("builder-generation")) {
      setManifestStatus("Insufficient credits for Builder generation.");
      addCreditsModal.showAddCredits();
      return;
    }

    setSpec(createSpecFromBrief(systemBrief));
    setHasGenerated(true);
    setAdvancedOpen(false);
    setManifestStatus("System generated. Advanced export is ready.");
  }

  return (
    <section
      id="builder-workspace"
      className="mx-auto w-full max-w-7xl scroll-mt-32 px-6 pb-28 pt-20 lg:px-10"
    >
      <div className="mb-10 max-w-3xl">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/45">
          SYSTEM BUILDER
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Start with the brief. Generate the system.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/55">
          Describe the product system once. EMOVEL turns it into sections, structure, preview,
          and an exportable manifest without backend generation.
        </p>
      </div>

      <div className="mb-5 border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <label className="space-y-3">
            <span className={labelClass()}>System Brief</span>
            <textarea
              value={systemBrief}
              onChange={(event) => setSystemBrief(event.target.value)}
              rows={6}
              placeholder="Describe the digital product page, audience, offer, and conversion path you want to build..."
              className="w-full resize-none border border-white/10 bg-black/35 px-5 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
            />
          </label>

          <div className="flex flex-col justify-between gap-4">
            <CreditDisplay balance={credits.balance} action="builder-generation" compact />
            <button
              type="button"
              onClick={generateSystem}
              disabled={!systemBrief.trim() || !canAfford("builder-generation")}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
            >
              Generate System ({costs["builder-generation"].estimatedCreditCost} credits)
            </button>
          </div>
        </div>
      </div>

      {!canAfford("builder-generation") ? (
        <div className="mb-5">
          <InsufficientCredits
            action="builder-generation"
            onAddCredits={addCreditsModal.showAddCredits}
          />
        </div>
      ) : null}

      {hasGenerated ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(460px,1.05fr)]">
          <SectionsPanel
            spec={spec}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onUpdateSection={updateSection}
          />
          <PreviewPanel spec={spec} manifest={manifestPreview} />
        </div>
      ) : (
        <div className="border border-white/10 bg-black/25 p-8 text-sm leading-7 text-white/50">
          Generate a system to reveal sections and preview. Raw spec controls, validation, output
          plan, and manifest export stay in Advanced.
        </div>
      )}

      <div className="mt-5 border border-white/10 bg-white/[0.025]">
        <button
          type="button"
          onClick={() => setAdvancedOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
            Advanced
          </span>
          <span className="text-sm text-white/45">{advancedOpen ? "Close" : "Open"}</span>
        </button>

        {advancedOpen ? (
          <div className="grid gap-5 border-t border-white/10 p-6 xl:grid-cols-[1fr_0.9fr]">
            <RawSpecPanel spec={spec} onUpdateSpecField={updateSpecField} />
            <div className="space-y-5">
              <ValidationPanel validation={validation} />
              <OutputPlanPanel outputPath={outputPlan.outputPath} outputPlan={outputPlan} />
              <ManifestPanel
                manifestStatus={manifestStatus}
                manifestPreview={manifestPreview}
                canExport={hasGenerated}
                onCopy={copyManifest}
                onDownload={downloadManifest}
              />
            </div>
          </div>
        ) : null}
      </div>

      <AddCreditsModal open={addCreditsModal.open} onClose={addCreditsModal.hideAddCredits} />
    </section>
  );
}

function SectionsPanel({
  spec,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
}: {
  spec: BuilderSpec;
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onUpdateSection: (index: number, field: keyof BuilderSection, value: string) => void;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.035] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={labelClass()}>Sections</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Generated conversion path</h3>
        </div>
        <button
          type="button"
          onClick={onAddSection}
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
                  onChange={(event) => onUpdateSection(index, "id", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass()}>Type</span>
                <select
                  className={selectFieldClass()}
                  value={section.type}
                  onChange={(event) =>
                    onUpdateSection(index, "type", event.target.value as SectionType)
                  }
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
                  onChange={(event) => onUpdateSection(index, "title", event.target.value)}
                />
              </label>
            </div>
            <label className="mt-3 block space-y-2">
              <span className={labelClass()}>Objective</span>
              <textarea
                className={`${textFieldClass()} min-h-20 resize-none leading-7`}
                value={section.objective}
                onChange={(event) => onUpdateSection(index, "objective", event.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={() => onRemoveSection(index)}
              className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition hover:text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({
  spec,
  manifest,
}: {
  spec: BuilderSpec;
  manifest: ExportManifest;
}) {
  return (
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

      <div className="mt-6">
        <RuntimePreview manifest={manifest} />
      </div>
    </div>
  );
}

function RawSpecPanel({
  spec,
  onUpdateSpecField,
}: {
  spec: BuilderSpec;
  onUpdateSpecField: <K extends keyof Omit<BuilderSpec, "sections">>(
    key: K,
    value: BuilderSpec[K],
  ) => void;
}) {
  return (
    <div className="border border-white/10 bg-black/25 p-6">
      <p className={labelClass()}>Raw Spec</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Product system input</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass()}>Template Name</span>
          <input
            className={textFieldClass()}
            value={spec.templateName}
            onChange={(event) => onUpdateSpecField("templateName", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Page Type</span>
          <input
            className={textFieldClass()}
            value={spec.pageType}
            onChange={(event) => onUpdateSpecField("pageType", event.target.value)}
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className={labelClass()}>Positioning</span>
          <textarea
            className={`${textFieldClass()} min-h-28 resize-none leading-7`}
            value={spec.positioning}
            onChange={(event) => onUpdateSpecField("positioning", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Target Audience</span>
          <textarea
            className={`${textFieldClass()} min-h-24 resize-none leading-7`}
            value={spec.targetAudience}
            onChange={(event) => onUpdateSpecField("targetAudience", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Offer</span>
          <textarea
            className={`${textFieldClass()} min-h-24 resize-none leading-7`}
            value={spec.offer}
            onChange={(event) => onUpdateSpecField("offer", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Style Preset</span>
          <select
            className={selectFieldClass()}
            value={spec.stylePreset}
            onChange={(event) => onUpdateSpecField("stylePreset", event.target.value as StylePreset)}
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
            onChange={(event) =>
              onUpdateSpecField("designDensity", event.target.value as DesignDensity)
            }
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
  );
}

function ValidationPanel({ validation }: { validation: ReturnType<typeof validateSpec> }) {
  return (
    <div className="border border-white/10 bg-black/25 p-6">
      <p className={labelClass()}>Validation</p>
      <h3 className="mt-3 text-xl font-semibold text-white">
        {validation.isReady ? "Spec ready for planning." : "Spec needs completion."}
      </h3>
      <div className="mt-5 h-2 bg-white/10">
        <div className="h-full bg-white" style={{ width: `${validation.readinessScore}%` }} />
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
  );
}

function OutputPlanPanel({
  outputPath,
  outputPlan,
}: {
  outputPath: string;
  outputPlan: ReturnType<typeof buildOutputPlan>;
}) {
  return (
    <div className="border border-white/10 bg-black/25 p-6">
      <p className={labelClass()}>Output Plan</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{outputPath}</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PlanList title="Folders" items={outputPlan.folders} />
        <PlanList title="Files" items={outputPlan.files} />
        <PlanList title="Components" items={outputPlan.components} />
        <PlanList title="Export Assets" items={outputPlan.exportAssets} />
      </div>
    </div>
  );
}

function ManifestPanel({
  manifestStatus,
  manifestPreview,
  canExport,
  onCopy,
  onDownload,
}: {
  manifestStatus: string;
  manifestPreview: ExportManifest;
  canExport: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="border border-white/10 bg-black/25 p-6">
      <p className={labelClass()}>Export Manifest</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Browser-only handoff</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">
        Manifest export generates JSON in the browser. It does not write server files, run builds,
        or create zip archives.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCopy}
          disabled={!canExport}
          className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/35 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/35"
        >
          Copy Manifest
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!canExport}
          className="bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
        >
          Download JSON
        </button>
      </div>
      <p className="mt-4 text-xs text-white/45">{manifestStatus}</p>
      <pre className="mt-5 max-h-80 overflow-auto bg-black/35 p-4 text-xs leading-6 text-white/55">
        {JSON.stringify(manifestPreview, null, 2)}
      </pre>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-white/10 bg-black/25 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">
        {title}
      </p>
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
