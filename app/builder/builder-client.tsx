"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AddCreditsModal,
  CreditDisplay,
  InsufficientCredits,
  useAddCreditsModal,
} from "../credits/credit-ui";
import { useCredits } from "../credits/credit-store";
import RuntimePreview from "../runtime/runtime-preview";
import { resolveStyle } from "./style-resolver";
import { TEMPLATE_REGISTRY, getTemplateMeta } from "./template-registry";
import {
  COMPONENT_TYPES,
  SECTION_TYPES,
  validateTemplateSpecV1,
  type TemplateComponentTypeV1,
  type TemplateIdV1,
  type TemplateSectionTypeV1,
  type TemplateSpecV1,
  type TemplateSpecValidationResult,
} from "./schema/v1";
import type { ExportManifest } from "./types";
import { useAuthSession } from "../../lib/auth/use-auth-session";

interface ImportedTemplate {
  spec: TemplateSpecV1;
  validation: TemplateSpecValidationResult;
}

interface PersistedBuilderSection {
  id: string;
  section_key: string;
  position: number;
  status?: string;
  content?: Record<string, unknown>;
}

interface PersistedBuilderProject {
  id: string;
  name: string;
  sections: PersistedBuilderSection[];
}

interface BuilderBrandProfile {
  brand_name: string;
  audience: string | null;
  tone: string | null;
  visual_direction: string | null;
  offer_positioning: string | null;
}

interface BuilderBootstrapResponse {
  profile: {
    onboarding_step: "brand_profile" | "first_project" | "complete";
  } | null;
  workspace: {
    id: string;
    name: string;
  };
  brandProfile: BuilderBrandProfile | null;
  projects: Array<{
    id: string;
    name: string;
  }>;
}

type BuilderGenerationState =
  | "empty"
  | "generating"
  | "streaming_partial"
  | "ready"
  | "error_retryable"
  | "error_blocked"
  | "error_billing"
  | "error_rate_limited";

interface AiGenerateEvent {
  type: "status" | "partial" | "spec" | "error";
  status?: BuilderGenerationState;
  content?: string;
  spec?: TemplateSpecV1;
  code?: string;
  error?: string;
}

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

function defaultComponentsFor(type: TemplateSectionTypeV1): TemplateComponentTypeV1[] {
  const map: Record<TemplateSectionTypeV1, TemplateComponentTypeV1[]> = {
    hero: ["eyebrow", "headline", "subheadline", "button"],
    problem: ["headline", "subheadline", "card"],
    mechanism: ["headline", "featureGrid"],
    offer: ["headline", "featureGrid", "mediaFrame"],
    benefits: ["headline", "featureGrid"],
    features: ["headline", "featureGrid", "card"],
    proof: ["headline", "statsRow", "testimonialBlock"],
    pricing: ["headline", "pricingBlock"],
    comparison: ["headline", "comparisonTable"],
    process: ["headline", "timeline"],
    faq: ["headline", "faqAccordion"],
    finalCta: ["headline", "subheadline", "button"],
    footer: ["logoStrip", "button"],
  };

  return map[type];
}

function createSection(type: TemplateSectionTypeV1, index: number) {
  return {
    id: index === 0 ? type : `${type}-${index + 1}`,
    type,
    title: `${formatLabel(type)} section`,
    objective: `Define the conversion role for the ${formatLabel(type)} section.`,
    components: defaultComponentsFor(type),
  };
}

function createSpecFromBrief(brief: string): TemplateSpecV1 {
  const summary = summarizeBrief(brief) || summarizeBrief(defaultBrief);
  const meta = TEMPLATE_REGISTRY.TOOL_PRIME;

  return {
    schemaVersion: "v1",
    templateId: "TOOL_PRIME",
    templateName: slugify(summary),
    pageType: meta.defaultPageType,
    positioning: summary,
    targetAudience:
      "Decision-makers who need a clearer system, stronger commercial logic, and a controlled path from idea to execution.",
    offer: {
      type: "digital_product_system",
      deliverable:
        "A structured digital product system that connects positioning, sections, proof, and conversion into one launch-ready asset.",
      format: "single_page_runtime_preview",
    },
    stylePreset: meta.recommendedStylePreset,
    designDensity: meta.recommendedDensity,
    ctaSystem: {
      primaryCtaLabel: "Enter The System",
      primaryCtaAction: "primary_conversion",
      secondaryCtaLabel: "Review The Structure",
      secondaryCtaAction: "scroll_to_mechanism",
    },
    pricingLogic: {
      hasPricing: false,
      pricingModel: "none",
      priceAnchors: [],
      justification: "Pricing is not configured for this generated preview.",
    },
    builderNotes: {
      recommendedFor:
        "Early product architecture, tool landing pages, and controlled commercial system previews.",
      avoid: "Avoid unsupported claims, fake proof, and decorative sections without a conversion role.",
      scalability:
        "Can expand into a full Template Spec v1 with pricing, proof, comparison, and advanced CTA logic.",
    },
    sections: [
      {
        id: "hero",
        type: "hero",
        title: "Turn the brief into a controlled product system.",
        objective: `Establish the core promise and commercial direction: ${summary}`,
        components: defaultComponentsFor("hero"),
      },
      {
        id: "mechanism",
        type: "mechanism",
        title: "Define the execution mechanism.",
        objective:
          "Explain how the system moves from raw direction to structured page logic, offer clarity, and production assets.",
        components: defaultComponentsFor("mechanism"),
      },
      {
        id: "proof",
        type: "proof",
        title: "Make the value legible.",
        objective:
          "Show why the structure is credible by connecting audience, outcome, workflow, and conversion path.",
        components: defaultComponentsFor("proof"),
      },
      {
        id: "final-cta",
        type: "finalCta",
        title: "Move the user into the system.",
        objective:
          "Create a clear next step without fake publishing, fake checkout, or unsupported claims.",
        components: defaultComponentsFor("finalCta"),
      },
    ],
  };
}

const defaultBrief =
  "A premium B2B landing page for a consultant who helps founders turn scattered execution into a controlled product system.";

const initialSpec = createSpecFromBrief(defaultBrief);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseImportPayload(value: unknown): unknown[] {
  if (isRecord(value) && Array.isArray(value.templates)) {
    return value.templates;
  }

  return [value];
}

function coerceValidSpec(value: unknown): TemplateSpecV1 | null {
  return validateTemplateSpecV1(value).isValid ? (value as TemplateSpecV1) : null;
}

function createManifest(spec: TemplateSpecV1, validation: TemplateSpecValidationResult): ExportManifest {
  return {
    schemaVersion: "v1",
    templateId: spec.templateId,
    spec,
    validation,
    style: resolveStyle(spec),
    generatedAt: new Date().toISOString(),
  };
}

function generationStateCopy(state: BuilderGenerationState) {
  const map: Record<BuilderGenerationState, string> = {
    empty: "Ready for a focused commercial brief.",
    generating: "Generating with the configured AI provider...",
    streaming_partial: "Streaming AI output into the project workspace...",
    ready: "AI generation completed. Sections are ready for review.",
    error_retryable: "Generation stopped. Adjust the brief or retry.",
    error_blocked: "Boundary layer blocked this request.",
    error_billing: "Plan limit reached for AI generation.",
    error_rate_limited: "Rate limit reached. Try again shortly.",
  };

  return map[state];
}

function isTemplateSpecSnapshot(value: unknown): value is TemplateSpecV1 {
  return validateTemplateSpecV1(value).isValid;
}

export default function BuilderClient() {
  const { token: authToken, signOut: signOutSession } = useAuthSession();
  const { credits, costs, canAfford, spendCredits } = useCredits();
  const addCreditsModal = useAddCreditsModal();
  const [systemBrief, setSystemBrief] = useState(defaultBrief);
  const [spec, setSpec] = useState<TemplateSpecV1>(initialSpec);
  const [importValue, setImportValue] = useState("");
  const [importStatus, setImportStatus] = useState("Paste a single Template Spec v1 or a { templates: [...] } batch.");
  const [importedTemplates, setImportedTemplates] = useState<ImportedTemplate[]>([]);
  const [selectedImportedIndex, setSelectedImportedIndex] = useState(0);
  const [manifestStatus, setManifestStatus] = useState("Generate or import a page structure before exporting.");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState(
    "Local mode: sign in to save projects and continue later.",
  );
  const [persistedProject, setPersistedProject] = useState<PersistedBuilderProject | null>(null);
  const [brandProfile, setBrandProfile] = useState<BuilderBrandProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationState, setGenerationState] = useState<BuilderGenerationState>("empty");
  const [streamingPreview, setStreamingPreview] = useState("");

  const validation = useMemo(() => validateTemplateSpecV1(spec), [spec]);
  const manifestPreview = useMemo(() => createManifest(spec, validation), [spec, validation]);
  const disabledReason = !systemBrief.trim()
    ? "Enter a page brief to generate the preview."
    : !canAfford("builder-generation")
      ? "Add credits to generate the page."
      : isGenerating
        ? generationStateCopy(generationState)
      : "";

  useEffect(() => {
    if (!authToken) {
      return;
    }
    const token = authToken;

    async function bootstrapBuilder() {
      try {
        const response = await fetch("/api/builder/bootstrap", {
          headers: authHeaders(token),
        });

        if (!response.ok) {
          throw new Error("Unable to connect Builder workspace.");
        }

        const data = (await response.json()) as BuilderBootstrapResponse;
        setBrandProfile(data.brandProfile || null);

        if (data.projects.length > 0) {
          await loadPersistedProject(data.projects[0].id, token);
          setBackendStatus(`Connected to ${data.workspace.name}. Latest project loaded.`);
          return;
        }

        setBackendStatus(`Connected to ${data.workspace.name}. Generate a page to create your first project.`);
      } catch (error) {
        setBackendStatus(error instanceof Error ? error.message : "Builder persistence is unavailable.");
      }
    }

    void bootstrapBuilder();
    // Builder bootstrap intentionally runs once from the stored browser session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markDirty() {
    setManifestStatus("Page structure changed. Export will use the current selection.");
  }

  function authHeaders(token = authToken): Record<string, string> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async function loadPersistedProject(projectId: string, token = authToken) {
    if (!token) {
      return null;
    }

    const response = await fetch(`/api/builder/projects/${projectId}`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Unable to load persisted project.");
    }

    const data = (await response.json()) as { project: PersistedBuilderProject };
    const snapshot = data.project.sections
      .map((section) => section.content?.specSnapshot)
      .find(isTemplateSpecSnapshot);

    setPersistedProject(data.project);

    if (snapshot) {
      setSpec(snapshot);
      setHasGenerated(true);
      setManifestStatus("Persisted page structure loaded from workspace.");
    }

    return data.project;
  }

  async function ensurePersistedProject(nextSpec: TemplateSpecV1) {
    if (!authToken) {
      setBackendStatus("Local mode: sign in to save projects and continue later.");
      return null;
    }

    if (persistedProject) {
      return persistedProject;
    }

    const response = await fetch("/api/builder/projects", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: nextSpec.templateName,
        product_type: nextSpec.pageType,
        commercial_goal: nextSpec.positioning,
        fixed_section_order: nextSpec.sections.map((section) => section.id),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setBackendStatus(data?.error || "Project persistence failed.");
      return null;
    }

    const data = (await response.json()) as {
      project: PersistedBuilderProject | null;
      workspace: { id: string };
    };

    if (data.project) {
      setPersistedProject(data.project);
      setBackendStatus("Project created in your personal workspace.");
    }

    return data.project;
  }

  async function persistSection(
    project: PersistedBuilderProject,
    nextSpec: TemplateSpecV1,
    section: TemplateSpecV1["sections"][number],
    index: number,
    source: "manual" | "regenerate",
  ) {
    const persistedSection =
      project.sections.find((item) => item.section_key === section.id) ||
      project.sections.find((item) => item.position === index);

    if (!persistedSection) {
      return;
    }

    await fetch(`/api/builder/sections/${persistedSection.id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        projectId: project.id,
        sectionKey: persistedSection.section_key,
        section: {
          title: section.title,
          content: {
            templateSpecSection: section,
            specSnapshot: index === 0 ? nextSpec : undefined,
          },
          status: "ready",
          error_message: null,
        },
        draft: {
          content: {
            templateSpecSection: section,
            specSnapshot: index === 0 ? nextSpec : undefined,
          },
          source,
        },
      }),
    });
  }

  async function persistSpec(nextSpec: TemplateSpecV1, source: "manual" | "regenerate") {
    const project = await ensurePersistedProject(nextSpec);

    if (!project) {
      return;
    }

    await Promise.all(
      nextSpec.sections.map((section, index) =>
        persistSection(project, nextSpec, section, index, source),
      ),
    );
    setBackendStatus("Page structure saved to your personal workspace.");
  }

  function updateSpecField<K extends keyof Pick<TemplateSpecV1, "templateName" | "pageType" | "positioning" | "targetAudience">>(
    key: K,
    value: TemplateSpecV1[K],
  ) {
    markDirty();
    setSpec((current) => ({ ...current, [key]: value }));
  }

  function updateTemplateId(templateId: TemplateIdV1) {
    const meta = getTemplateMeta(templateId);

    markDirty();
    setSpec((current) => ({
      ...current,
      templateId,
      pageType: meta?.defaultPageType || current.pageType,
      designDensity: meta?.recommendedDensity || current.designDensity,
      stylePreset: meta?.recommendedStylePreset || current.stylePreset,
    }));
  }

  function updateOfferField<K extends keyof TemplateSpecV1["offer"]>(
    key: K,
    value: TemplateSpecV1["offer"][K],
  ) {
    markDirty();
    setSpec((current) => ({ ...current, offer: { ...current.offer, [key]: value } }));
  }

  function updateCtaField<K extends keyof TemplateSpecV1["ctaSystem"]>(
    key: K,
    value: TemplateSpecV1["ctaSystem"][K],
  ) {
    markDirty();
    setSpec((current) => ({ ...current, ctaSystem: { ...current.ctaSystem, [key]: value } }));
  }

  function updatePricingModel(value: TemplateSpecV1["pricingLogic"]["pricingModel"]) {
    markDirty();
    setSpec((current) => ({
      ...current,
      pricingLogic: {
        ...current.pricingLogic,
        pricingModel: value,
        hasPricing: value !== "none",
      },
    }));
  }

  function updateSection(index: number, field: "id" | "title" | "objective", value: string) {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }));
    const nextSpec = {
      ...spec,
      sections: spec.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    };

    void persistSpec(nextSpec, "manual");
  }

  function updateSectionType(index: number, type: TemplateSectionTypeV1) {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index
          ? { ...section, type, components: defaultComponentsFor(type) }
          : section,
      ),
    }));
    const nextSpec = {
      ...spec,
      sections: spec.sections.map((section, sectionIndex) =>
        sectionIndex === index
          ? { ...section, type, components: defaultComponentsFor(type) }
          : section,
      ),
    };

    void persistSpec(nextSpec, "manual");
  }

  function toggleSectionComponent(index: number, component: TemplateComponentTypeV1) {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => {
        if (sectionIndex !== index) {
          return section;
        }

        const hasComponent = section.components.includes(component);
        return {
          ...section,
          components: hasComponent
            ? section.components.filter((item) => item !== component)
            : [...section.components, component],
        };
      }),
    }));
    const nextSpec = {
      ...spec,
      sections: spec.sections.map((section, sectionIndex) => {
        if (sectionIndex !== index) {
          return section;
        }

        const hasComponent = section.components.includes(component);
        return {
          ...section,
          components: hasComponent
            ? section.components.filter((item) => item !== component)
            : [...section.components, component],
        };
      }),
    };

    void persistSpec(nextSpec, "manual");
  }

  function addSection() {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: [...current.sections, createSection("features", current.sections.length)],
    }));
  }

  function removeSection(index: number) {
    markDirty();
    setSpec((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  }

  function applyGeneratedSpec(nextSpec: TemplateSpecV1, status: string) {
    setSpec(nextSpec);
    setImportedTemplates([]);
    setSelectedImportedIndex(0);
    setHasGenerated(true);
    setAdvancedOpen(false);
    setManifestStatus(status);
  }

  function generateLocalFallback(status = "Local fallback generated. Export is ready.") {
    const nextSpec = createSpecFromBrief(systemBrief);

    applyGeneratedSpec(nextSpec, status);
    setGenerationState("ready");
    void persistSpec(nextSpec, "regenerate");
  }

  async function readGenerationError(response: Response) {
    const data = (await response.json().catch(() => null)) as {
      code?: string;
      error?: string;
      boundary?: {
        category?: string;
        requiredClarification?: string;
      };
    } | null;

    return {
      code: data?.code,
      message: data?.error || "AI generation failed.",
    };
  }

  async function streamAiGeneration(project: PersistedBuilderProject) {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        brief: systemBrief,
        projectId: project.id,
        currentSpec: spec,
      }),
    });

    if (!response.ok || !response.body) {
      const error = await readGenerationError(response);

      if (error.code === "AI_NOT_CONFIGURED") {
        generateLocalFallback("AI provider is not configured. Local fallback generated for development.");
        return;
      }

      if (error.code === "RATE_LIMITED") {
        setGenerationState("error_rate_limited");
      } else if (error.code === "BILLING_GATE") {
        setGenerationState("error_billing");
      } else if (error.code === "BLOCKED_REQUEST") {
        setGenerationState("error_blocked");
      } else {
        setGenerationState("error_retryable");
      }

      setManifestStatus(error.message);
      setBackendStatus(error.message);
      return;
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
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const event = JSON.parse(line) as AiGenerateEvent;

        if (event.type === "status") {
          setGenerationState(event.status || "generating");
          setManifestStatus(generationStateCopy(event.status || "generating"));
        }

        if (event.type === "partial" && event.content) {
          setGenerationState("streaming_partial");
          setStreamingPreview((current) => `${current}${event.content}`.slice(-900));
          setManifestStatus(generationStateCopy("streaming_partial"));
        }

        if (event.type === "spec" && event.spec) {
          applyGeneratedSpec(event.spec, "AI generation completed. Export is ready.");
          setGenerationState("ready");
          setStreamingPreview("");
          await loadPersistedProject(project.id);
        }

        if (event.type === "error") {
          setGenerationState("error_retryable");
          setManifestStatus(event.error || "AI generation failed.");
          setBackendStatus(event.error || "AI generation failed.");
        }
      }
    }
  }

  async function generateSystem() {
    if (!systemBrief.trim()) {
      setManifestStatus("Add a page brief before generating.");
      return;
    }

    if (!spendCredits("builder-generation")) {
      setManifestStatus("Insufficient credits for page generation.");
      addCreditsModal.showAddCredits();
      return;
    }

    setIsGenerating(true);
    setGenerationState("generating");
    setStreamingPreview("");
    setManifestStatus(generationStateCopy("generating"));

    try {
      if (!authToken) {
        generateLocalFallback("Local mode: generated without AI persistence. Sign in to use streaming AI.");
        return;
      }

      const seedSpec = createSpecFromBrief(systemBrief);
      const project = await ensurePersistedProject(seedSpec);

      if (!project) {
        setGenerationState("error_retryable");
        return;
      }

      await streamAiGeneration(project);
    } catch (error) {
      setGenerationState("error_retryable");
      setManifestStatus(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function importJson() {
    try {
      const parsed = JSON.parse(importValue) as unknown;
      const entries = parseImportPayload(parsed).map((item) => ({
        spec: item,
        validation: validateTemplateSpecV1(item),
      }));
      const validEntries = entries
        .map((entry) => {
          const validSpec = coerceValidSpec(entry.spec);
          return validSpec ? { spec: validSpec, validation: entry.validation } : null;
        })
        .filter((entry): entry is ImportedTemplate => Boolean(entry));
      const invalidCount = entries.length - validEntries.length;

      setImportedTemplates(validEntries);
      setSelectedImportedIndex(0);

      if (validEntries.length > 0) {
        setSpec(validEntries[0].spec);
        setHasGenerated(true);
        void persistSpec(validEntries[0].spec, "manual");
      }

      setImportStatus(
        `${validEntries.length} valid template(s), ${invalidCount} invalid template(s). Invalid templates were not loaded.`,
      );
      setManifestStatus("Imported page structure is ready for selected-template export.");
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : "JSON import failed.");
    }
  }

  function selectImportedTemplate(index: number) {
    const selected = importedTemplates[index];

    if (!selected) {
      return;
    }

    setSelectedImportedIndex(index);
    setSpec(selected.spec);
    setManifestStatus("Selected imported page structure is ready for export.");
    void persistSpec(selected.spec, "manual");
  }

  async function copyManifest() {
    if (!hasGenerated) {
      setManifestStatus("Generate or import a page structure before exporting.");
      return;
    }

    await navigator.clipboard.writeText(JSON.stringify(manifestPreview, null, 2));
    setManifestStatus("Page manifest copied to clipboard.");
  }

  async function downloadManifest() {
    if (!hasGenerated) {
      setManifestStatus("Generate or import a page structure before exporting.");
      return;
    }

    const blob = new Blob([JSON.stringify(manifestPreview, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${spec.templateName}-v1-manifest.json`;
    link.click();
    URL.revokeObjectURL(url);
    setManifestStatus("Selected page manifest downloaded locally.");
  }

  function handleSignOut() {
    signOutSession();
    setPersistedProject(null);
    setBrandProfile(null);
    setBackendStatus("Local mode: sign in to save projects and continue later.");
  }

  async function acceptCurrentProject() {
    if (!authToken || !persistedProject) {
      setManifestStatus("Sign in and generate a persisted project before accepting sections.");
      return;
    }

    await Promise.all(
      persistedProject.sections.map((section) =>
        fetch(`/api/builder/sections/${section.id}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({
            projectId: persistedProject.id,
            sectionKey: section.section_key,
            section: {},
            accept: true,
          }),
        }),
      ),
    );
    setManifestStatus("Sections accepted explicitly.");
    setBackendStatus("Persisted sections marked as accepted.");
    await loadPersistedProject(persistedProject.id);
  }

  return (
    <section
      id="builder-workspace"
      className="mx-auto w-full max-w-7xl scroll-mt-32 px-6 pb-28 pt-20 lg:px-10"
    >
      <div className="mb-10 max-w-3xl">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/45">
          EMOVEL PAGE BUILDER
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Generate a premium commercial page from a focused brief.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/55">
          Shape the offer, page structure, CTA direction, and preview surface without exposing the
          technical template system until you need advanced control.
        </p>
      </div>

      <div className="mb-5 border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <label className="space-y-3">
            <span className={labelClass()}>Page Brief</span>
            <textarea
              value={systemBrief}
              onChange={(event) => setSystemBrief(event.target.value)}
              rows={6}
              placeholder="Describe the page, audience, offer, commercial angle, and conversion path you want to build..."
              className="w-full resize-none border border-white/10 bg-black/35 px-5 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
            />
          </label>

          <div className="flex flex-col justify-between gap-4">
            <CreditDisplay balance={credits.balance} action="builder-generation" compact />
            <div>
              <button
                type="button"
                onClick={generateSystem}
                disabled={!systemBrief.trim() || !canAfford("builder-generation") || isGenerating}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
              >
                {isGenerating
                  ? "Generating..."
                  : `Generate Page (${costs["builder-generation"].estimatedCreditCost} credits)`}
              </button>
              {disabledReason ? (
                <p className="mt-3 text-xs leading-6 text-slate-500">{disabledReason}</p>
              ) : null}
              {isGenerating ? (
                <p className="mt-3 text-xs leading-6 text-white/45">
                  {generationStateCopy(generationState)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {streamingPreview ? (
        <div className="mb-5 max-h-40 overflow-hidden border border-white/10 bg-black/25 p-5 text-xs leading-6 text-white/45">
          {streamingPreview}
        </div>
      ) : null}

      {!canAfford("builder-generation") ? (
        <div className="mb-5">
          <InsufficientCredits
            action="builder-generation"
            onAddCredits={addCreditsModal.showAddCredits}
          />
        </div>
      ) : null}

      <div className="mb-5 border border-white/10 bg-black/25 p-5 text-sm leading-7 text-white/55">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p>{backendStatus}</p>
            {authToken ? (
              brandProfile ? (
                <p className="mt-2 text-white/45">
                  Brand context: {brandProfile.brand_name}
                  {brandProfile.tone ? ` / ${brandProfile.tone}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-white/45">
                  Complete your Brand Profile to make outputs sharper and consistent.
                </p>
              )
            ) : null}
          </div>
          {authToken ? (
            <div className="flex shrink-0 flex-wrap gap-3">
              {!brandProfile ? (
                <Link
                  href="/onboarding/brand-profile"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
                >
                  Brand Profile
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/55 hover:border-white/25 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-white/85"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {hasGenerated ? (
        <div className="space-y-5">
          <CommercialSummary spec={spec} validation={validation} />
          <PreviewPanel spec={spec} manifest={manifestPreview} />
        </div>
      ) : (
        <div className="border border-white/10 bg-black/25 p-8 text-sm leading-7 text-white/50">
          Generate a page or import a valid structure from Advanced Control to reveal the preview.
        </div>
      )}

      <div className="mt-5 border border-white/10 bg-white/[0.025]">
        <button
          type="button"
          onClick={() => setAdvancedOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
            Advanced Control
          </span>
          <span className="text-sm text-white/45">{advancedOpen ? "Close" : "Open"}</span>
        </button>

        {advancedOpen ? (
          <div className="border-t border-white/10 p-4 sm:p-6">
            <ImportPanel
              importValue={importValue}
              importStatus={importStatus}
              importedTemplates={importedTemplates}
              selectedImportedIndex={selectedImportedIndex}
              onImportValueChange={setImportValue}
              onImportJson={importJson}
              onSelectImportedTemplate={selectImportedTemplate}
            />

            <ValidationReport spec={spec} validation={validation} />

            {hasGenerated ? (
              <SpecPanel
                spec={spec}
                onUpdateSpecField={updateSpecField}
                onUpdateTemplateId={updateTemplateId}
                onUpdateOfferField={updateOfferField}
                onUpdateCtaField={updateCtaField}
                onUpdatePricingModel={updatePricingModel}
                onAddSection={addSection}
                onRemoveSection={removeSection}
                onUpdateSection={updateSection}
                onUpdateSectionType={updateSectionType}
                onToggleSectionComponent={toggleSectionComponent}
              />
            ) : (
              <div className="mb-5 border border-white/10 bg-black/25 p-6 text-sm leading-7 text-white/50">
                Generate or import a page before editing the full structure.
              </div>
            )}

            <ManifestPanel
              manifestStatus={manifestStatus}
              manifestPreview={manifestPreview}
              canExport={hasGenerated}
              onCopy={copyManifest}
              onDownload={downloadManifest}
              onAccept={acceptCurrentProject}
            />
          </div>
        ) : null}
      </div>

      <AddCreditsModal open={addCreditsModal.open} onClose={addCreditsModal.hideAddCredits} />
    </section>
  );
}

function CommercialSummary({
  spec,
  validation,
}: {
  spec: TemplateSpecV1;
  validation: TemplateSpecValidationResult;
}) {
  const templateMeta = getTemplateMeta(spec.templateId);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="border border-white/10 bg-white/[0.035] p-6">
        <p className={labelClass()}>Commercial Summary</p>
        <h3 className="mt-3 text-xl font-semibold text-white">
          {spec.templateName}
        </h3>
        <div className="mt-5 grid gap-3 text-sm leading-7 text-white/55">
          <p>Model: {templateMeta?.label || spec.templateId}</p>
          <p>Sections: {spec.sections.length}</p>
          <p>Readiness: {validation.readinessScore}/100</p>
        </div>
      </div>
      <div className="border border-white/10 bg-black/25 p-6">
        <p className={labelClass()}>Offer Direction</p>
        <p className="mt-3 text-sm leading-7 text-white/65">{spec.offer.deliverable}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/55">
            {spec.ctaSystem.primaryCtaLabel}
          </span>
          <span className="border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/35">
            {spec.ctaSystem.secondaryCtaLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function ImportPanel({
  importValue,
  importStatus,
  importedTemplates,
  selectedImportedIndex,
  onImportValueChange,
  onImportJson,
  onSelectImportedTemplate,
}: {
  importValue: string;
  importStatus: string;
  importedTemplates: ImportedTemplate[];
  selectedImportedIndex: number;
  onImportValueChange: (value: string) => void;
  onImportJson: () => void;
  onSelectImportedTemplate: (index: number) => void;
}) {
  return (
    <div className="mb-5 border border-white/10 bg-black/25 p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <label className="space-y-3">
          <span className={labelClass()}>JSON Import</span>
          <textarea
            value={importValue}
            onChange={(event) => onImportValueChange(event.target.value)}
            rows={8}
            placeholder={'{ "templates": [ ... ] } or a single TemplateSpecV1 object'}
            className="w-full resize-none border border-white/10 bg-black/35 px-5 py-4 font-mono text-xs leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
          />
        </label>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className={labelClass()}>Import Status</p>
            <p className="mt-3 text-sm leading-7 text-white/55">{importStatus}</p>
          </div>
          <button
            type="button"
            onClick={onImportJson}
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-white/85"
          >
            Validate Import
          </button>
        </div>
      </div>

      {importedTemplates.length > 1 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {importedTemplates.map((entry, index) => (
            <button
              key={`${entry.spec.templateId}-${entry.spec.templateName}-${index}`}
              type="button"
              onClick={() => onSelectImportedTemplate(index)}
              className={`border p-4 text-left ${
                selectedImportedIndex === index
                  ? "border-white/40 bg-white/[0.08]"
                  : "border-white/10 bg-white/[0.025]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {entry.spec.templateId}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{entry.spec.templateName}</p>
              <p className="mt-2 text-xs text-white/45">
                Score: {entry.validation.readinessScore}
              </p>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ValidationReport({
  spec,
  validation,
}: {
  spec: TemplateSpecV1;
  validation: TemplateSpecValidationResult;
}) {
  const unsupportedFields =
    validation.warnings.filter((warning) => warning.includes("Unknown top-level field")).length;

  return (
    <div className="mb-5 grid gap-5 lg:grid-cols-[0.7fr_1fr]">
      <div className="border border-white/10 bg-white/[0.035] p-5">
        <p className={labelClass()}>Technical Validation</p>
        <div className="mt-4 grid gap-3 text-sm text-white/60">
          <p>Template ID: {spec.templateId}</p>
          <p>Schema: {spec.schemaVersion}</p>
          <p>Readiness: {validation.readinessScore}</p>
          <p>Sections: {spec.sections.length}</p>
          <p>Warnings: {validation.warnings.length}</p>
          <p>Errors: {validation.errors.length}</p>
          <p>Unsupported fields/components: {unsupportedFields}</p>
        </div>
      </div>
      <div className="border border-white/10 bg-black/25 p-5">
        <p className={labelClass()}>Errors / Warnings</p>
        <div className="mt-4 space-y-2 text-sm leading-6">
          {validation.errors.length === 0 && validation.warnings.length === 0 ? (
            <p className="text-white/55">No validation issues detected.</p>
          ) : null}
          {validation.errors.map((error) => (
            <p key={error} className="text-red-200">{error}</p>
          ))}
          {validation.warnings.map((warning) => (
            <p key={warning} className="text-amber-100">{warning}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpecPanel({
  spec,
  onUpdateSpecField,
  onUpdateTemplateId,
  onUpdateOfferField,
  onUpdateCtaField,
  onUpdatePricingModel,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onUpdateSectionType,
  onToggleSectionComponent,
}: {
  spec: TemplateSpecV1;
  onUpdateSpecField: <K extends keyof Pick<TemplateSpecV1, "templateName" | "pageType" | "positioning" | "targetAudience">>(
    key: K,
    value: TemplateSpecV1[K],
  ) => void;
  onUpdateTemplateId: (templateId: TemplateIdV1) => void;
  onUpdateOfferField: <K extends keyof TemplateSpecV1["offer"]>(
    key: K,
    value: TemplateSpecV1["offer"][K],
  ) => void;
  onUpdateCtaField: <K extends keyof TemplateSpecV1["ctaSystem"]>(
    key: K,
    value: TemplateSpecV1["ctaSystem"][K],
  ) => void;
  onUpdatePricingModel: (value: TemplateSpecV1["pricingLogic"]["pricingModel"]) => void;
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onUpdateSection: (index: number, field: "id" | "title" | "objective", value: string) => void;
  onUpdateSectionType: (index: number, type: TemplateSectionTypeV1) => void;
  onToggleSectionComponent: (index: number, component: TemplateComponentTypeV1) => void;
}) {
  return (
    <div className="min-w-0 overflow-hidden border border-white/10 bg-white/[0.035] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={labelClass()}>Page Structure</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Selected page structure</h3>
        </div>
        <button
          type="button"
          onClick={onAddSection}
          className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/35"
        >
          Add Section
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass()}>Template ID</span>
          <select
            className={selectFieldClass()}
            value={spec.templateId}
            onChange={(event) => onUpdateTemplateId(event.target.value as TemplateIdV1)}
          >
            {Object.values(TEMPLATE_REGISTRY).map((entry) => (
              <option key={entry.templateId} value={entry.templateId}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
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
        <label className="space-y-2">
          <span className={labelClass()}>Pricing Model</span>
          <select
            className={selectFieldClass()}
            value={spec.pricingLogic.pricingModel}
            onChange={(event) =>
              onUpdatePricingModel(event.target.value as TemplateSpecV1["pricingLogic"]["pricingModel"])
            }
          >
            {["none", "one-time", "tiered", "subscription", "application"].map((model) => (
              <option key={model} value={model}>
                {formatLabel(model)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 lg:col-span-2">
          <span className={labelClass()}>Positioning</span>
          <textarea
            className={`${textFieldClass()} min-h-24 resize-none leading-7`}
            value={spec.positioning}
            onChange={(event) => onUpdateSpecField("positioning", event.target.value)}
          />
        </label>
        <label className="space-y-2 lg:col-span-2">
          <span className={labelClass()}>Target Audience</span>
          <textarea
            className={`${textFieldClass()} min-h-20 resize-none leading-7`}
            value={spec.targetAudience}
            onChange={(event) => onUpdateSpecField("targetAudience", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Offer Type</span>
          <input
            className={textFieldClass()}
            value={spec.offer.type}
            onChange={(event) => onUpdateOfferField("type", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Offer Format</span>
          <input
            className={textFieldClass()}
            value={spec.offer.format}
            onChange={(event) => onUpdateOfferField("format", event.target.value)}
          />
        </label>
        <label className="space-y-2 lg:col-span-2">
          <span className={labelClass()}>Offer Deliverable</span>
          <textarea
            className={`${textFieldClass()} min-h-20 resize-none leading-7`}
            value={spec.offer.deliverable}
            onChange={(event) => onUpdateOfferField("deliverable", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Primary CTA</span>
          <input
            className={textFieldClass()}
            value={spec.ctaSystem.primaryCtaLabel}
            onChange={(event) => onUpdateCtaField("primaryCtaLabel", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass()}>Secondary CTA</span>
          <input
            className={textFieldClass()}
            value={spec.ctaSystem.secondaryCtaLabel}
            onChange={(event) => onUpdateCtaField("secondaryCtaLabel", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-8 space-y-4">
        {spec.sections.map((section, index) => (
          <div
            key={`${section.id}-${index}`}
            className="min-w-0 overflow-hidden border border-white/10 bg-black/25 p-4"
          >
            <div className="grid min-w-0 gap-3 lg:grid-cols-[0.9fr_0.8fr_1.3fr]">
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
                    onUpdateSectionType(index, event.target.value as TemplateSectionTypeV1)
                  }
                >
                  {SECTION_TYPES.map((type) => (
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
            <div className="mt-4 flex flex-wrap gap-2">
              {COMPONENT_TYPES.map((component) => (
                <button
                  key={component}
                  type="button"
                  onClick={() => onToggleSectionComponent(index, component)}
                  className={`border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    section.components.includes(component)
                      ? "border-white/35 bg-white/10 text-white"
                      : "border-white/10 text-white/35"
                  }`}
                >
                  {component}
                </button>
              ))}
            </div>
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
  spec: TemplateSpecV1;
  manifest: ExportManifest;
}) {
  return (
    <div className="min-w-0 overflow-hidden border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={labelClass()}>Preview</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Generated page preview</h3>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">
          {formatLabel(spec.stylePreset)} / {formatLabel(spec.designDensity)}
        </p>
      </div>

      <div className="mt-6">
        <RuntimePreview manifest={manifest} />
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
  onAccept,
}: {
  manifestStatus: string;
  manifestPreview: ExportManifest;
  canExport: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onAccept: () => void;
}) {
  return (
    <div className="min-w-0 overflow-hidden border-t border-white/10 p-4 sm:p-6">
      <p className={labelClass()}>Advanced Export</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Selected page structure only</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">
        Batch imports can be previewed one page at a time. Export currently writes the selected
        structure only.
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
        <button
          type="button"
          onClick={onAccept}
          disabled={!canExport}
          className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/35 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/35"
        >
          Accept Sections
        </button>
      </div>
      <p className="mt-4 text-xs text-white/45">{manifestStatus}</p>
      <pre className="mt-5 max-h-80 max-w-full overflow-auto bg-black/35 p-4 text-xs leading-6 text-white/55">
        {JSON.stringify(manifestPreview, null, 2)}
      </pre>
    </div>
  );
}
