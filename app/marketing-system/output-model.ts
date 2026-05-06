import type { FinalPackage } from "../assistants/types";
import type {
  MarketingBackgroundMode,
  MarketingImageModel,
  MarketingPlatformFormat,
  MarketingResult,
} from "./types";

export const backgroundModes: MarketingBackgroundMode[] = [
  "cinematic-dark",
  "luxury-gradient",
  "product-studio",
  "clean-white",
  "transparent-style",
];

export const platformFormats: MarketingPlatformFormat[] = [
  "Instagram/Facebook Post",
  "Story/Reel Cover",
  "Square Product Ad",
];

export const platformLabels: Record<MarketingPlatformFormat, string> = {
  "Instagram/Facebook Post": "Post Instagram / Facebook",
  "Story/Reel Cover": "Coperta Story / Reel",
  "Square Product Ad": "Reclama patrata de produs",
};

export const formatSizes: Record<MarketingPlatformFormat, string> = {
  "Instagram/Facebook Post": "1080x1080",
  "Story/Reel Cover": "1080x1920",
  "Square Product Ad": "1080x1080",
};

export const backgroundLabels: Record<MarketingBackgroundMode, string> = {
  "cinematic-dark": "Cinematic intunecat",
  "luxury-gradient": "Gradient luxury",
  "product-studio": "Studio de produs",
  "clean-white": "Alb editorial",
  "transparent-style": "Stil transparent",
};

function compact(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function keywordsFrom(value: string) {
  return compact(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !commonWords.has(word))
    .slice(0, 5);
}

const commonWords = new Set([
  "pentru",
  "campanie",
  "campanii",
  "marketing",
  "social",
  "asset",
  "oferta",
  "publicul",
  "vizuala",
  "directia",
  "cerere",
  "emovel",
]);

function firstMeaningfulLine(value: string) {
  return compact(value)
    .split(/(?<=[.!?])\s+|\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function requestSummaryFrom(input: string, result: FinalPackage) {
  const marketingOutput =
    result.responses.find((response) => response.assistantId === "marketing")?.output || "";
  const source =
    firstMeaningfulLine(input) ||
    firstMeaningfulLine(marketingOutput) ||
    firstMeaningfulLine(result.plan.taskSummary) ||
    "campanie EMOVEL";
  const summary = compact(source);

  return summary.length > 150 ? `${summary.slice(0, 147)}...` : summary;
}

function campaignTitleFrom(input: string, result: FinalPackage) {
  const summary = requestSummaryFrom(input, result)
    .replace(/^(cerere directa pentru|direct marketing system request for:|source request:)/i, "")
    .trim();
  const title = summary.split(" ").slice(0, 8).join(" ");

  return title ? `Campanie: ${title}` : "Campanie EMOVEL";
}

export function createMarketingResult(input: string, result: FinalPackage): MarketingResult {
  const marketingOutput =
    result.responses.find((response) => response.assistantId === "marketing")?.output || "";
  const requestSummary = requestSummaryFrom(input, result);
  const campaignTitle = campaignTitleFrom(input, result);
  const hashtags = [
    "EMOVEL",
    "AssetComercial",
    "SistemMarketing",
    "ExecutieControlata",
    ...keywordsFrom(`${input} ${marketingOutput}`),
  ]
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 8)
    .map((value) => `#${value}`);

  return {
    campaignTitle,
    platform: "Instagram / Facebook + Story / Reel",
    visualVariantA: "Post comercial Instagram / Facebook",
    visualVariantB: "Coperta verticala Story / Reel",
    caption: [
      `Cerere de campanie: ${requestSummary}`,
      "Directie EMOVEL: transforma aceasta cerere intr-un asset comercial premium, cu mesaj clar, ritm editorial si o promisiune controlata.",
      "Structura recomandata: deschidere precisa, valoare comerciala, detaliu de oferta si CTA calm, fara hype sau rezultate fabricate.",
    ].join("\n\n"),
    hashtags,
    cta: "Intra in sistem",
    format: "Social Pack V1",
    status: "draft",
  };
}

export function createImageModel(
  marketingResult: MarketingResult,
  platformFormat: MarketingPlatformFormat,
  backgroundMode: MarketingBackgroundMode,
): MarketingImageModel {
  return {
    visualPrompt: [
      `Creeaza un ${platformLabels[platformFormat]} premium pentru EMOVEL.`,
      `Titlu campanie: ${marketingResult.campaignTitle}.`,
      `Mod fundal: ${backgroundLabels[backgroundMode]}.`,
      `Context de mesaj: ${marketingResult.caption.split("\n")[0]}.`,
      "Directie vizuala: luxury tech editorial, compozitie comerciala controlata, contrast ridicat, spatiu rafinat, fara aspect de stock ieftin.",
      `Include discret CTA-ul: ${marketingResult.cta}.`,
      "Nu include interfete de social media, logo-uri de platforme sau metrici false de engagement.",
    ].join(" "),
    platformFormat,
    backgroundMode,
    stylePreset: "EMOVEL comercial premium",
    size: formatSizes[platformFormat],
    status: "ready",
  };
}
