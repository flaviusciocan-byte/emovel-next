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

export const marketingSystemTranslations: Record<string, MarketingSystemTranslation> = {
  en: {
    page: {
      eyebrow: "Marketing System",
      headline: "Commercial output production for EMOVEL campaigns.",
      subheadline:
        "Generate a Social Pack from assistant context, prepare visual prompts, and keep local campaign drafts in one focused execution surface.",
      missingContext:
        "No assistant handoff is available yet. Run a marketing request through the assistants system first.",
      backToAssistants: "Open Assistants",
    },
    system: {
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
    page: {
      eyebrow: "Sistem Marketing",
      headline: "Producție de output comercial pentru campanii EMOVEL.",
      subheadline:
        "Generează un Social Pack din contextul asistenților, pregătește prompturi vizuale și păstrează drafturile locale într-o suprafață de execuție separată.",
      missingContext:
        "Nu există încă un handoff din assistants. Rulează mai întâi o cerere de marketing prin sistemul de asistenți.",
      backToAssistants: "Deschide Assistants",
    },
    system: {
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
