export type MarketingSystemTranslation = {
  page: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    missingContext: string;
    backToAssistants: string;
  };
  system: {
    eyebrow: string;
    headline: string;
    description: string;
    contextLoaded: string;
    campaignRequest: string;
    campaignRequestPlaceholder: string;
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
    currentPreview: string;
    savedDraft: string;
    platform: string;
    cta: string;
    localDrafts: string;
    noDrafts: string;
    emptyState: string;
    creditBalance: string;
    costLabel: string;
    modelRoute: string;
    addCredits: string;
    addCreditsTitle: string;
    addCreditsDescription: string;
    close: string;
    unavailableSoon: string;
    promptPrepOnly: string;
    localReminderNote: string;
    draftStatus: string;
    readyStatus: string;
  };
};

const romanianMarketingSystem: MarketingSystemTranslation = {
  page: {
    eyebrow: "Marketing System",
    headline: "Productie de output comercial pentru campanii EMOVEL.",
    subheadline:
      "Transforma o cerere de campanie intr-un Social Pack local: pozitionare, caption, CTA, hashtaguri, prompt vizual si drafturi salvate in browser.",
    missingContext:
      "Nu exista inca un handoff din Assistants. Pagina poate rula direct dintr-o cerere de campanie.",
    backToAssistants: "Deschide Assistants",
  },
  system: {
    eyebrow: "Sistem de executie marketing",
    headline: "Genereaza un Social Pack comercial din cererea ta.",
    description:
      "V1 pregateste output local pentru campanii premium: mesaj comercial, structura vizuala, prompt pentru imagine si drafturi locale. Nu exista publicare live, imagine generata automat sau integrare cu platforme externe.",
    contextLoaded: "Context incarcat din Assistants",
    campaignRequest: "Cerere de campanie",
    campaignRequestPlaceholder:
      "Descrie assetul de campanie, publicul, oferta, CTA-ul, platforma si directia vizuala pe care vrei sa le produci...",
    generate: "Genereaza Social Pack",
    ready: "Pregatit pentru generarea unui Social Pack local.",
    insufficientCredits:
      "Credite insuficiente. Nu a fost generat niciun output nou.",
    generated: "Social Pack generat ca previzualizare de draft local.",
    captionCopied: "Captionul a fost copiat in clipboard.",
    promptCopied: "Promptul vizual a fost copiat in clipboard.",
    saved: "Campanie salvata local ca draft.",
    scheduled: "Reminder local salvat. Nu exista publicare automata.",
    visualPrep: "Pregatire prompt vizual",
    visualPrepTitle: "Model de cerere pentru imagine",
    backgroundMode: "Mod fundal",
    format: "Format",
    style: "Stil",
    size: "Dimensiune",
    status: "Status",
    visualPrompt: "Prompt vizual",
    generateImage: "In curand: generare imagine",
    copyPrompt: "Copiaza promptul",
    downloadImage: "In curand: descarcare imagine",
    copyCaption: "Copiaza captionul",
    saveCampaign: "Salveaza draft",
    publishLater: "Salveaza reminder local",
    campaign: "Campanie",
    currentPreview: "Previzualizare draft curent",
    savedDraft: "Draft local salvat",
    platform: "Platforma",
    cta: "CTA",
    localDrafts: "Drafturi locale",
    noDrafts: "Nu exista campanii salvate local.",
    emptyState:
      "Introdu o cerere clara si genereaza un Social Pack. Outputul ramane local pana il salvezi ca draft.",
    creditBalance: "Credite disponibile",
    costLabel: "Cost",
    modelRoute: "Ruta model",
    addCredits: "Adauga credite",
    addCreditsTitle: "Credite in curand",
    addCreditsDescription:
      "Platile nu sunt conectate in aceasta versiune. In productie, acest pas va trimite catre checkout securizat si ledger server-side.",
    close: "Inchide",
    unavailableSoon: "In curand",
    promptPrepOnly: "Pregatire prompt, fara generatie automata.",
    localReminderNote: "Reminder local. Nu exista publicare automata sau integrare social media.",
    draftStatus: "draft local",
    readyStatus: "pregatit",
  },
};

export const marketingSystemTranslations: Record<string, MarketingSystemTranslation> = {
  en: romanianMarketingSystem,
  ro: romanianMarketingSystem,
};
