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

export const formatSizes: Record<MarketingPlatformFormat, string> = {
  "Instagram/Facebook Post": "1080x1080",
  "Story/Reel Cover": "1080x1920",
  "Square Product Ad": "1080x1080",
};

export const backgroundLabels: Record<MarketingBackgroundMode, string> = {
  "cinematic-dark": "Cinematic Dark",
  "luxury-gradient": "Luxury Gradient",
  "product-studio": "Product Studio",
  "clean-white": "Clean White",
  "transparent-style": "Transparent Style",
};

function compact(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function keywordsFrom(value: string) {
  return compact(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 5);
}

function campaignTitleFrom(input: string, result: FinalPackage) {
  const marketingOutput =
    result.responses.find((response) => response.assistantId === "marketing")?.output || "";
  const source = marketingOutput || result.plan.taskSummary || input || "EMOVEL Social Campaign";

  return compact(source)
    .replace(/^(Commercial Messaging|Controlled assistant plan for:)/i, "")
    .trim()
    .split(" ")
    .slice(0, 7)
    .join(" ");
}

export function createMarketingResult(input: string, result: FinalPackage): MarketingResult {
  const marketingOutput =
    result.responses.find((response) => response.assistantId === "marketing")?.output || "";
  const campaignTitle = campaignTitleFrom(input, result);
  const hashtags = [
    "EMOVEL",
    "DigitalProducts",
    "AISystems",
    "MarketingSystems",
    ...keywordsFrom(`${input} ${marketingOutput}`),
  ]
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 8)
    .map((value) => `#${value}`);

  return {
    campaignTitle,
    platform: "Facebook / Instagram + TikTok / Story",
    visualVariantA: "Facebook / Instagram post",
    visualVariantB: "TikTok / Story / Reel Cover",
    caption: `${campaignTitle} reframes the offer as a controlled digital product system. Use it to move from scattered execution to commercial structure, clear positioning, and a cleaner conversion path.`,
    hashtags,
    cta: "Enter The System",
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
      `Create a premium ${platformFormat} for EMOVEL.`,
      `Campaign title: ${marketingResult.campaignTitle}.`,
      `Background mode: ${backgroundLabels[backgroundMode]}.`,
      "Visual direction: editorial luxury-tech, controlled commercial composition, high contrast, refined spacing, no cheap stock style.",
      `Include subtle campaign cue for: ${marketingResult.cta}.`,
      "Do not include platform UI, logos from social networks, or fake engagement metrics.",
    ].join(" "),
    platformFormat,
    backgroundMode,
    stylePreset: "EMOVEL premium commercial",
    size: formatSizes[platformFormat],
    status: "ready",
  };
}
