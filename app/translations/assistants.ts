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
    assistantFunctions: {
      core: string;
      orchestrator: string;
      marketing: string;
      maintenance: string;
      commerce: string;
    };
  };
  marketing: {
    eyebrow: string;
    headline: string;
    description: string;
    generate: string;
    ready: string;
    insufficientCredits: string;
    generated: string;
    captionCopied: string;
    promptCopied: string;
    saved: string;
    scheduled: string;
    visualPrep: string;
    visualPrepTitle: string;
    backgroundMode: string;
    format: string;
    style: string;
    size: string;
    status: string;
    visualPrompt: string;
    generateImage: string;
    copyPrompt: string;
    downloadImage: string;
    copyCaption: string;
    saveCampaign: string;
    publishLater: string;
    campaign: string;
    platform: string;
    cta: string;
    localDrafts: string;
    noDrafts: string;
    emptyState: string;
  };
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
      assistantFunctions: {
        core: "Structure raw requests into execution logic",
        orchestrator: "Sequence modules into one controlled handoff",
        marketing: "Shape premium commercial positioning",
        maintenance: "Audit coherence and production quality",
        commerce: "Clarify offer architecture and conversion path",
      },
    },
    marketing: {
      eyebrow: "Marketing Output System",
      headline: "Generate a commercial Social Pack from the Marketing module.",
      description:
        "V1 creates two local visual variants, caption, hashtags, CTA, campaign metadata, and draft actions. No live publishing or platform integrations are connected.",
      generate: "Generate Social Pack",
      ready: "Ready to generate a local Social Pack.",
      insufficientCredits:
        "Insufficient credits for Marketing Social Pack generation.",
      generated: "Social Pack generated as a local draft.",
      captionCopied: "Caption copied to clipboard.",
      promptCopied: "Visual prompt copied to clipboard.",
      saved: "Campaign saved locally.",
      scheduled: "Publish Later saved as a local reminder only.",
      visualPrep: "Image Generation Prep",
      visualPrepTitle: "Professional image request model",
      backgroundMode: "Background Mode",
      format: "Format",
      style: "Style",
      size: "Size",
      status: "Status",
      visualPrompt: "Visual Prompt",
      generateImage: "Generate Professional Image",
      copyPrompt: "Copy Prompt",
      downloadImage: "Download Image",
      copyCaption: "Copy Caption",
      saveCampaign: "Save Campaign",
      publishLater: "Publish Later",
      campaign: "Campaign",
      platform: "Platform",
      cta: "CTA",
      localDrafts: "Local Drafts",
      noDrafts: "No saved campaigns yet.",
      emptyState:
        "Generate the Social Pack after reviewing the assistant output. Saved campaigns remain local to this browser.",
    },
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
      assistantFunctions: {
        core: "Structurează cereri brute în logică de execuție",
        orchestrator: "Secvențiază modulele într-un handoff controlat",
        marketing: "Definește poziționare comercială premium",
        maintenance: "Auditează coerența și calitatea de producție",
        commerce: "Clarifică arhitectura de ofertă și calea de conversie",
      },
    },
    marketing: {
      eyebrow: "Sistem de output marketing",
      headline: "Generează un Social Pack comercial din modulul Marketing.",
      description:
        "V1 creează două variante vizuale locale, caption, hashtaguri, CTA, metadate de campanie și acțiuni de draft. Publicarea live și integrările de platformă nu sunt conectate.",
      generate: "Generează Social Pack",
      ready: "Pregătit pentru generarea unui Social Pack local.",
      insufficientCredits:
        "Credite insuficiente pentru generarea Social Pack-ului Marketing.",
      generated: "Social Pack generat ca draft local.",
      captionCopied: "Caption copiat în clipboard.",
      promptCopied: "Promptul vizual a fost copiat în clipboard.",
      saved: "Campanie salvată local.",
      scheduled: "Publish Later salvat doar ca reminder local.",
      visualPrep: "Pregătire imagine",
      visualPrepTitle: "Model profesional pentru cererea de imagine",
      backgroundMode: "Mod fundal",
      format: "Format",
      style: "Stil",
      size: "Dimensiune",
      status: "Status",
      visualPrompt: "Prompt vizual",
      generateImage: "Generează imagine profesională",
      copyPrompt: "Copiază promptul",
      downloadImage: "Descarcă imaginea",
      copyCaption: "Copiază captionul",
      saveCampaign: "Salvează campania",
      publishLater: "Publică mai târziu",
      campaign: "Campanie",
      platform: "Platformă",
      cta: "CTA",
      localDrafts: "Drafturi locale",
      noDrafts: "Nu există campanii salvate.",
      emptyState:
        "Generează Social Pack-ul după revizuirea outputului. Campaniile salvate rămân locale în acest browser.",
    },
  },
};
