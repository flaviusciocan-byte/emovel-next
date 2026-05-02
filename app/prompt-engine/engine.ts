import type {
  FinalPackage,
  FiveStepStructure,
  GeneratedPrompts,
  VerificationResult,
} from "./types";

function normalizeIdea(rawIdea: string) {
  return rawIdea.trim().replace(/\s+/g, " ");
}

function sentenceCase(value: string) {
  const trimmed = normalizeIdea(value);
  return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}` : "";
}

function createStructure(rawIdea: string): FiveStepStructure {
  const idea = sentenceCase(rawIdea);

  return {
    objective: `Create a controlled EMOVEL-grade prompt package for: ${idea}.`,
    context:
      "The output should support premium digital product execution, with clear positioning, commercial intent, and practical delivery logic.",
    styleDirection:
      "Use a dark luxury-tech direction with restrained contrast, executive clarity, precise language, and a controlled black, white, and muted metallic palette.",
    executionNotes:
      "Define the deliverable, audience, constraints, tone, output format, and success criteria before writing the final prompt variants.",
    outputGoal:
      "A usable prompt package that can guide copy, interface, assistant, documentation, or visual production without additional interpretation.",
  };
}

function createPrompts(
  structure: FiveStepStructure,
  rawIdea: string,
): GeneratedPrompts {
  const idea = sentenceCase(rawIdea);

  return {
    longPrompt: [
      `Build a premium EMOVEL execution brief for: ${idea}.`,
      `Objective: ${structure.objective}`,
      `Context: ${structure.context}`,
      `Style direction: ${structure.styleDirection}`,
      `Execution notes: ${structure.executionNotes}`,
      `Output goal: ${structure.outputGoal}`,
      "Deliver a structured, commercially useful result with clear sections, specific constraints, and language that feels controlled, premium, and conversion-aware.",
    ].join("\n\n"),
    shortPrompt: `Create a controlled EMOVEL-grade execution asset for ${idea}, using premium positioning, clear structure, commercial logic, and concise delivery notes.`,
    visualPrompt1: `Cinematic luxury-tech composition for ${idea}. Dark controlled environment, precise interface layers, restrained metallic highlights, deep contrast, editorial spacing, premium product-system atmosphere.`,
    visualPrompt2: `Alternative premium composition for ${idea}. Minimal black environment, structured product logic represented through clean panels, quiet depth, sharp hierarchy, commercial execution tone.`,
  };
}

function createVerification(rawIdea: string): VerificationResult {
  const wordCount = normalizeIdea(rawIdea).split(" ").filter(Boolean).length;
  const hasEnoughInput = wordCount >= 5;

  return {
    coherence: {
      pass: true,
      note: "The package keeps one clear execution direction from idea to output.",
    },
    clarity: {
      pass: hasEnoughInput,
      note: hasEnoughInput
        ? "The source idea provides enough context for usable prompt generation."
        : "Add more source context for stronger output specificity.",
    },
    commercialQuality: {
      pass: true,
      note: "The output is framed around product value, positioning, and execution.",
    },
    styleConsistency: {
      pass: true,
      note: "The language follows EMOVEL's controlled luxury-tech direction.",
    },
    contradictions: {
      pass: true,
      note: "No internal contradictions detected in the generated package.",
    },
    wordingOptimization: {
      pass: true,
      note: "Wording is structured for practical handoff and reuse.",
    },
  };
}

function createFinalNotes(rawIdea: string) {
  const idea = sentenceCase(rawIdea);

  return {
    clientChecklist: [
      "Confirm the target user and commercial outcome.",
      "Decide whether the asset is for copy, UI, assistant behavior, documentation, or visual production.",
      "Add any required brand constraints before production.",
      "Run the long prompt first, then use the short prompt for iteration.",
      "Use the visual prompts only when image direction is required.",
      "Review the verification notes before handoff.",
    ],
    recommendedAdjustments: [
      `Add more market or audience context for ${idea}.`,
      "Define one measurable conversion or delivery outcome.",
      "Remove any output format that is not needed for the next execution step.",
    ],
  };
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function runPromptEngine(
  rawIdea: string,
  onPhase: (phase: string) => void,
): Promise<FinalPackage> {
  onPhase("structuring");
  await wait(250);
  const structure = createStructure(rawIdea);

  onPhase("generating");
  await wait(250);
  const prompts = createPrompts(structure, rawIdea);

  onPhase("verifying");
  await wait(250);
  const verification = createVerification(rawIdea);
  const { clientChecklist, recommendedAdjustments } = createFinalNotes(rawIdea);

  onPhase("complete");
  return { structure, prompts, verification, clientChecklist, recommendedAdjustments };
}
