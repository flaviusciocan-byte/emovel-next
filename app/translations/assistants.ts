import { marketingSystemTranslations } from "./marketing-system";

export type AssistantsTranslation = {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    cta: string;
  };
  finalCta: {
    eyebrow: string;
    headline: string;
    cta: string;
  };
  client: {
    phases: {
      orchestrating: string;
      executing: string;
      reviewing: string;
      complete: string;
    };
    copy: string;
    copied: string;
    open: string;
    close: string;
    activeAssistantSuffix: string;
    emptyRequest: string;
    addCredits: string;
    processingNotice: string;
    insufficientCredits: string;
    failure: string;
    eyebrow: string;
    headline: string;
    requestLabel: string;
    placeholder: string;
    characters: string;
    processing: string;
    runSystem: string;
    credits: string;
    orchestratorPlan: string;
    task: string;
    qualityReview: string;
    marketingHandoffEyebrow: string;
    marketingHandoffHeadline: string;
    marketingHandoffDescription: string;
    marketingHandoffCta: string;
    assistantFunctions: {
      core: string;
      orchestrator: string;
      marketing: string;
      maintenance: string;
      commerce: string;
    };
  };
  marketing: typeof marketingSystemTranslations.en.system;
};

export const assistantsTranslations: Record<string, AssistantsTranslation> = {
  en: {
    hero: {
      eyebrow: "Execution Modules",
      headline: "Orchestrated execution for premium digital assets.",
      subheadline:
        "Route one strategic request through EMOVEL modules for product logic, commercial positioning, offer architecture, and controlled output.",
      cta: "Run The System",
    },
    finalCta: {
      eyebrow: "Commercial Handoff",
      headline: "Turn the next request into a controlled execution package.",
      cta: "Contact EMOVEL",
    },
    client: {
      phases: {
        orchestrating: "Orchestrating",
        executing: "Executing",
        reviewing: "Reviewing",
        complete: "Complete",
      },
      copy: "Copy",
      copied: "Copied",
      open: "Open",
      close: "Close",
      activeAssistantSuffix: "is executing.",
      emptyRequest: "Enter a strategic request to run the orchestrated system.",
      addCredits: "Add credits to run the execution system.",
      processingNotice: "The execution system is currently processing.",
      insufficientCredits: "Insufficient credits for assistants orchestration.",
      failure: "Assistant system failed.",
      eyebrow: "Assistant System",
      headline:
        "Route one request through specialized EMOVEL execution modules.",
      requestLabel: "Strategic Request",
      placeholder:
        "Example: Build a premium commercial asset for an EMOVEL template shop, including positioning, offer architecture, social copy, and quality review.",
      characters: "characters",
      processing: "Processing",
      runSystem: "Run System",
      credits: "credits",
      orchestratorPlan: "Orchestrator Plan",
      task: "Module Brief",
      qualityReview: "Quality Review",
      marketingHandoffEyebrow: "Marketing Handoff",
      marketingHandoffHeadline:
        "Continue this output inside the dedicated Marketing System.",
      marketingHandoffDescription:
        "The assistant context is ready for Social Pack generation, visual prompt preparation, and local campaign drafts.",
      marketingHandoffCta: "Open Marketing System",
      assistantFunctions: {
        core: "Structure raw requests into execution logic",
        orchestrator: "Sequence modules into one controlled handoff",
        marketing: "Shape premium commercial positioning",
        maintenance: "Audit coherence and production quality",
        commerce: "Clarify offer architecture and conversion path",
      },
    },
    marketing: marketingSystemTranslations.en.system,
  },
  ro: {
    hero: {
      eyebrow: "Module de execuție",
      headline: "Execuție orchestrată pentru asseturi digitale premium.",
      subheadline:
        "Direcționează o cerere strategică prin modulele EMOVEL pentru logică de produs, poziționare comercială, arhitectură de ofertă și output controlat.",
      cta: "Rulează sistemul",
    },
    finalCta: {
      eyebrow: "Handoff comercial",
      headline: "Transformă următoarea cerere într-un pachet de execuție controlată.",
      cta: "Contactează EMOVEL",
    },
    client: {
      phases: {
        orchestrating: "Orchestrare",
        executing: "Execuție",
        reviewing: "Revizuire",
        complete: "Complet",
      },
      copy: "Copiază",
      copied: "Copiat",
      open: "Deschide",
      close: "Închide",
      activeAssistantSuffix: "rulează.",
      emptyRequest: "Introdu o cerere strategică pentru sistemul orchestrat.",
      addCredits: "Adaugă credite pentru a rula sistemul de execuție.",
      processingNotice: "Sistemul de execuție procesează cererea.",
      insufficientCredits: "Credite insuficiente pentru orchestrarea modulelor.",
      failure: "Sistemul de asistenți a eșuat.",
      eyebrow: "Sistem de asistenți",
      headline:
        "Direcționează o cerere prin module specializate de execuție EMOVEL.",
      requestLabel: "Cerere strategică",
      placeholder:
        "Exemplu: Construiește un asset comercial premium pentru un shop de template-uri EMOVEL, cu poziționare, arhitectură de ofertă, copy social și revizuire de calitate.",
      characters: "caractere",
      processing: "Procesare",
      runSystem: "Rulează sistemul",
      credits: "credite",
      orchestratorPlan: "Plan de orchestrare",
      task: "Brief de modul",
      qualityReview: "Revizuire de calitate",
      marketingHandoffEyebrow: "Handoff Marketing",
      marketingHandoffHeadline:
        "Continuă acest output în sistemul dedicat de Marketing.",
      marketingHandoffDescription:
        "Contextul asistenților este pregătit pentru generarea Social Pack-ului, pregătirea prompturilor vizuale și drafturi locale de campanie.",
      marketingHandoffCta: "Deschide Marketing System",
      assistantFunctions: {
        core: "Structurează cereri brute în logică de execuție",
        orchestrator: "Secvențiază modulele într-un handoff controlat",
        marketing: "Definește poziționare comercială premium",
        maintenance: "Auditează coerența și calitatea de producție",
        commerce: "Clarifică arhitectura de ofertă și calea de conversie",
      },
    },
    marketing: marketingSystemTranslations.ro.system,
  },
};
