import type { AssistantId, AssistantMeta } from "./types";

export const ASSISTANTS: Record<AssistantId, AssistantMeta> = {
  core: {
    id: "core",
    name: "EMOVEL CORE",
    role:
      "Central logic module for structure, standards, prompt quality, and controlled system definition.",
    functions: [
      "Analyze and structure raw requests",
      "Define system logic and constraints",
      "Standardize output quality",
    ],
    color: "#D4C08A",
  },
  orchestrator: {
    id: "orchestrator",
    name: "EMOVEL ORCHESTRATOR",
    role:
      "Coordination module that routes tasks, preserves execution order, and reviews final coherence.",
    functions: [
      "Route tasks across assistants",
      "Sequence dependencies",
      "Review final package consistency",
    ],
    color: "#FFFFFF",
  },
  marketing: {
    id: "marketing",
    name: "EMOVEL MARKETING",
    role:
      "Commercial language module for positioning, page copy, offer language, and social execution.",
    functions: [
      "Write premium commercial copy",
      "Clarify positioning and benefits",
      "Shape conversion-focused messages",
    ],
    color: "#C7B16A",
  },
  maintenance: {
    id: "maintenance",
    name: "EMOVEL MAINTENANCE",
    role:
      "Quality module for auditing, correction, optimization, and long-term system reliability.",
    functions: [
      "Audit logic and structure",
      "Identify gaps and contradictions",
      "Recommend optimizations",
    ],
    color: "#B8B8B8",
  },
  commerce: {
    id: "commerce",
    name: "EMOVEL COMMERCE",
    role:
      "Monetization module for offer structure, pricing logic, value presentation, and conversion path clarity.",
    functions: [
      "Structure offers",
      "Translate value into commercial logic",
      "Clarify conversion path",
    ],
    color: "#D4C08A",
  },
};

export const ASSISTANT_ORDER: AssistantId[] = [
  "core",
  "orchestrator",
  "marketing",
  "maintenance",
  "commerce",
];
