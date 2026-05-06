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

const marketingKeywords = [
  "copy",
  "marketing",
  "social",
  "landing",
  "page",
  "description",
  "brand",
  "pagina",
  "pagină",
  "descriere",
  "reclama",
  "reclamă",
  "campanie",
  "campanii",
  "pozitionare",
  "poziționare",
  "asset comercial",
  "comercial",
  "oferta",
  "ofertă",
];

const commerceKeywords = [
  "price",
  "pricing",
  "offer",
  "sell",
  "shop",
  "monetize",
  "revenue",
  "pret",
  "preț",
  "oferta",
  "ofertă",
  "vinde",
  "vanzare",
  "vânzare",
  "magazin",
  "monetizare",
  "venit",
  "conversie",
];

const maintenanceKeywords = [
  "audit",
  "fix",
  "optimize",
  "update",
  "improve",
  "quality",
  "auditeaza",
  "auditează",
  "repara",
  "repară",
  "optimizeaza",
  "optimizează",
  "actualizeaza",
  "actualizează",
  "imbunatateste",
  "îmbunătățește",
  "calitate",
  "revizuire",
  "corecteaza",
  "corectează",
];

const romanianSignals = [
  "cerere",
  "sistem",
  "execuție",
  "executie",
  "asset",
  "ofertă",
  "oferta",
  "comercial",
  "poziționare",
  "pozitionare",
  "calitate",
  "campanie",
];

function isRomanianRequest(input: string) {
  return /[ăâîșț]/i.test(input) || includesAny(input, romanianSignals);
}

const orchestratorCopy = {
  en: {
    coreTask:
      "Structure the request into a controlled execution system with clear objective, constraints, and output requirements.",
    marketingTask:
      "Create premium commercial positioning, benefit language, and conversion-ready messaging.",
    commerceTask:
      "Define offer logic, monetization structure, value framing, and conversion path.",
    maintenanceTask:
      "Audit the system for gaps, contradictions, unclear logic, and optimization opportunities.",
    orchestratorTask:
      "Review assistant outputs, align the final package, and identify next execution steps.",
    planPrefix: "Controlled assistant plan for: ",
    outputs: {
      core: [
        "System Structure",
        "Objective: Convert the request into a controlled EMOVEL execution asset.",
        "Required layers: clear objective, target output, constraints, quality standard, and delivery format.",
        "Execution standard: premium, structured, commercially credible, and ready for reuse.",
      ],
      marketing: [
        "Commercial Messaging",
        "Position the asset as a controlled digital product system, not a generic deliverable.",
        "Lead with the transformation: raw idea to structured, monetizable execution.",
        "Use restrained premium language, direct benefit framing, and a clear conversion path.",
      ],
      maintenance: [
        "Quality Audit",
        "Check the request for missing audience, unclear output format, vague success criteria, and unsupported claims.",
        "Recommended correction: define one primary outcome, one target user, and one delivery format before production.",
      ],
      commerce: [
        "Offer Logic",
        "Package the value around outcome, structure, speed, and controlled execution.",
        "Suggested commercial path: core deliverable, premium enhancement, and implementation support.",
        "Conversion requirement: make the next step explicit and low-friction.",
      ],
      orchestrator: [
        "Final Coordination",
        "The package should move from system definition to commercial messaging, then quality review and execution.",
        "Next step: select the primary deliverable and generate production-ready copy or documentation.",
      ],
    },
    sourceRequest: "Source request",
    aligned: "Previous assistant outputs are aligned into one controlled handoff.",
    noPrevious: "No previous outputs were available for alignment.",
    rulesApplied: "Rules applied",
    reviewFor: "Quality review for",
    modulesUsed: "Modules used",
    reviewLines: [
      "The output is coherent when the final deliverable, audience, and conversion path remain explicit.",
      "No critical contradictions detected.",
      "Best next refinement: add concrete audience context and the exact production format required.",
    ],
  },
  ro: {
    coreTask:
      "Structurează cererea într-un sistem de execuție controlată, cu obiectiv, constrângeri și cerințe de output clare.",
    marketingTask:
      "Construiește poziționare comercială premium, limbaj de beneficiu și mesaje pregătite pentru conversie.",
    commerceTask:
      "Definește logica de ofertă, structura de monetizare, valoarea prezentată și calea de conversie.",
    maintenanceTask:
      "Auditează sistemul pentru goluri, contradicții, logică neclară și oportunități de optimizare.",
    orchestratorTask:
      "Revizuiește outputurile modulelor, aliniază pachetul final și identifică următorii pași de execuție.",
    planPrefix: "Plan orchestrat pentru: ",
    outputs: {
      core: [
        "Structură de sistem",
        "Obiectiv: transformă cererea într-un asset de execuție controlată EMOVEL.",
        "Straturi necesare: obiectiv clar, output țintă, constrângeri, standard de calitate și format de livrare.",
        "Standard de execuție: premium, structurat, credibil comercial și pregătit pentru reutilizare.",
      ],
      marketing: [
        "Mesaj comercial",
        "Poziționează assetul ca sistem digital controlat, nu ca livrabil generic.",
        "Condu transformarea: idee brută în execuție structurată și monetizabilă.",
        "Folosește limbaj premium reținut, beneficii directe și o cale clară de conversie.",
      ],
      maintenance: [
        "Audit de calitate",
        "Verifică lipsa audienței, formatul neclar, criteriile vagi de succes și afirmațiile nesusținute.",
        "Corecție recomandată: definește un rezultat principal, un utilizator țintă și un format de livrare înainte de producție.",
      ],
      commerce: [
        "Logică de ofertă",
        "Ambalează valoarea în jurul rezultatului, structurii, vitezei și execuției controlate.",
        "Cale comercială sugerată: livrabil central, extensie premium și suport de implementare.",
        "Cerință de conversie: următorul pas trebuie să fie explicit și ușor de parcurs.",
      ],
      orchestrator: [
        "Coordonare finală",
        "Pachetul trebuie să treacă din definiție de sistem în mesaj comercial, apoi în revizuire de calitate și execuție.",
        "Pas următor: selectează livrabilul principal și generează copy sau documentație pregătită pentru producție.",
      ],
    },
    sourceRequest: "Cerere sursă",
    aligned: "Outputurile modulelor anterioare sunt aliniate într-un handoff controlat.",
    noPrevious: "Nu au existat outputuri anterioare pentru aliniere.",
    rulesApplied: "Reguli aplicate",
    reviewFor: "Revizuire de calitate pentru",
    modulesUsed: "Module folosite",
    reviewLines: [
      "Outputul este coerent când livrabilul final, audiența și calea de conversie rămân explicite.",
      "Nu au fost detectate contradicții critice.",
      "Cea mai bună rafinare următoare: adaugă context concret despre audiență și formatul exact de producție.",
    ],
  },
};

export async function orchestrate(userInput: string): Promise<OrchestratorPlan> {
  const copy = isRomanianRequest(userInput) ? orchestratorCopy.ro : orchestratorCopy.en;
  const assignments: OrchestratorPlan["assignments"] = [
    {
      assistant: "core",
      task: copy.coreTask,
      order: 1,
    },
  ];

  if (includesAny(userInput, marketingKeywords)) {
    assignments.push({
      assistant: "marketing",
      task: copy.marketingTask,
      order: assignments.length + 1,
    });
  }

  if (includesAny(userInput, commerceKeywords)) {
    assignments.push({
      assistant: "commerce",
      task: copy.commerceTask,
      order: assignments.length + 1,
    });
  }

  if (includesAny(userInput, maintenanceKeywords)) {
    assignments.push({
      assistant: "maintenance",
      task: copy.maintenanceTask,
      order: assignments.length + 1,
    });
  }

  assignments.push({
    assistant: "orchestrator",
    task: copy.orchestratorTask,
    order: assignments.length + 1,
  });

  return {
    taskSummary: `${copy.planPrefix}${summarizeTask(userInput)}`,
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
  const copy = isRomanianRequest(originalRequest) ? orchestratorCopy.ro : orchestratorCopy.en;

  const outputByAssistant: Record<AssistantId, string> = {
    core: [
      copy.outputs.core[0],
      copy.outputs.core[1],
      `${copy.sourceRequest}: ${summarizeTask(originalRequest)}`,
      copy.outputs.core[2],
      copy.outputs.core[3],
    ].join("\n"),
    marketing: copy.outputs.marketing.join("\n"),
    maintenance: copy.outputs.maintenance.join("\n"),
    commerce: copy.outputs.commerce.join("\n"),
    orchestrator: [
      copy.outputs.orchestrator[0],
      copy.outputs.orchestrator[1],
      previousOutputs ? copy.aligned : copy.noPrevious,
      copy.outputs.orchestrator[2],
    ].join("\n"),
  };

  return {
    assistantId,
    assistantName: profile.name,
    task,
    output: cleanAssistantOutput(`${outputByAssistant[assistantId]}\n\n${copy.rulesApplied}: ${rules}`),
  };
}

export async function qualityReview(
  responses: AssistantResponse[],
  originalRequest: string,
): Promise<string> {
  const coveredAssistants = responses.map((response) => response.assistantName).join(", ");
  const copy = isRomanianRequest(originalRequest) ? orchestratorCopy.ro : orchestratorCopy.en;

  return cleanAssistantOutput(
    [
      `${copy.reviewFor}: ${summarizeTask(originalRequest)}`,
      `${copy.modulesUsed}: ${coveredAssistants}.`,
      ...copy.reviewLines,
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
