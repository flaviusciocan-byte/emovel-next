import { ASSISTANTS } from "./profiles";
import { cleanAssistantOutput } from "./output-cleanup";
import { buildRuleSummary } from "./rules";
import type {
  AssistantId,
  AssistantResponse,
  FinalPackage,
  OrchestratorPlan,
} from "./types";

function normalizeInput(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function summarizeTask(input: string) {
  const normalized = normalizeInput(input);
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function includesAny(input: string, keywords: string[]) {
  const value = input.toLowerCase();
  return keywords.some((keyword) => value.includes(keyword));
}

export async function orchestrate(userInput: string): Promise<OrchestratorPlan> {
  const assignments: OrchestratorPlan["assignments"] = [
    {
      assistant: "core",
      task: "Structure the request into a controlled execution system with clear objective, constraints, and output requirements.",
      order: 1,
    },
  ];

  if (
    includesAny(userInput, [
      "copy",
      "marketing",
      "social",
      "landing",
      "page",
      "description",
      "brand",
    ])
  ) {
    assignments.push({
      assistant: "marketing",
      task: "Create premium commercial positioning, benefit language, and conversion-ready messaging.",
      order: assignments.length + 1,
    });
  }

  if (
    includesAny(userInput, [
      "price",
      "pricing",
      "offer",
      "sell",
      "shop",
      "monetize",
      "revenue",
    ])
  ) {
    assignments.push({
      assistant: "commerce",
      task: "Define offer logic, monetization structure, value framing, and conversion path.",
      order: assignments.length + 1,
    });
  }

  if (
    includesAny(userInput, [
      "audit",
      "fix",
      "optimize",
      "update",
      "improve",
      "quality",
    ])
  ) {
    assignments.push({
      assistant: "maintenance",
      task: "Audit the system for gaps, contradictions, unclear logic, and optimization opportunities.",
      order: assignments.length + 1,
    });
  }

  assignments.push({
    assistant: "orchestrator",
    task: "Review assistant outputs, align the final package, and identify next execution steps.",
    order: assignments.length + 1,
  });

  return {
    taskSummary: `Controlled assistant plan for: ${summarizeTask(userInput)}`,
    assignments,
  };
}

export async function executeAssistant(
  assistantId: AssistantId,
  task: string,
  originalRequest: string,
  previousOutputs: string,
): Promise<AssistantResponse> {
  const profile = ASSISTANTS[assistantId];
  const rules = buildRuleSummary();

  const outputByAssistant: Record<AssistantId, string> = {
    core: [
      "System Structure",
      `Objective: Convert the request into a controlled EMOVEL execution asset.`,
      `Source request: ${summarizeTask(originalRequest)}`,
      "Required layers: clear objective, target output, constraints, quality standard, and delivery format.",
      "Execution standard: premium, structured, commercially credible, and ready for reuse.",
    ].join("\n"),
    marketing: [
      "Commercial Messaging",
      "Position the asset as a controlled digital product system, not a generic deliverable.",
      "Lead with the transformation: raw idea to structured, monetizable execution.",
      "Use restrained premium language, direct benefit framing, and a clear conversion path.",
    ].join("\n"),
    maintenance: [
      "Quality Audit",
      "Check the request for missing audience, unclear output format, vague success criteria, and unsupported claims.",
      "Recommended correction: define one primary outcome, one target user, and one delivery format before production.",
    ].join("\n"),
    commerce: [
      "Offer Logic",
      "Package the value around outcome, structure, speed, and controlled execution.",
      "Suggested commercial path: core deliverable, premium enhancement, and implementation support.",
      "Conversion requirement: make the next step explicit and low-friction.",
    ].join("\n"),
    orchestrator: [
      "Final Coordination",
      "The package should move from system definition to commercial messaging, then quality review and execution.",
      previousOutputs
        ? "Previous assistant outputs are aligned into one controlled handoff."
        : "No previous outputs were available for alignment.",
      "Next step: select the primary deliverable and generate production-ready copy or documentation.",
    ].join("\n"),
  };

  return {
    assistantId,
    assistantName: profile.name,
    task,
    output: cleanAssistantOutput(`${outputByAssistant[assistantId]}\n\nRules applied: ${rules}`),
  };
}

export async function qualityReview(
  responses: AssistantResponse[],
  originalRequest: string,
): Promise<string> {
  const coveredAssistants = responses.map((response) => response.assistantName).join(", ");

  return cleanAssistantOutput(
    [
      `Quality review for: ${summarizeTask(originalRequest)}`,
      `Modules used: ${coveredAssistants}.`,
      "The output is coherent when the final deliverable, audience, and conversion path remain explicit.",
      "No critical contradictions detected.",
      "Best next refinement: add concrete audience context and the exact production format required.",
    ].join("\n"),
  );
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function runAssistantSystem(
  userInput: string,
  onPhase: (phase: string) => void,
  onAssistantStart: (id: AssistantId) => void,
): Promise<FinalPackage> {
  onPhase("orchestrating");
  await wait(250);
  const plan = await orchestrate(userInput);

  onPhase("executing");
  const responses: AssistantResponse[] = [];

  for (const assignment of [...plan.assignments].sort((a, b) => a.order - b.order)) {
    onAssistantStart(assignment.assistant);
    await wait(220);
    const previousContext = responses
      .map((response) => `[${response.assistantName}]: ${response.output.slice(0, 500)}`)
      .join("\n");
    const response = await executeAssistant(
      assignment.assistant,
      assignment.task,
      userInput,
      previousContext,
    );
    responses.push(response);
  }

  onPhase("reviewing");
  await wait(250);
  const qualityCheck = await qualityReview(responses, userInput);

  onPhase("complete");
  return { plan, responses, qualityCheck, timestamp: new Date().toISOString() };
}
