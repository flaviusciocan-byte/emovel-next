"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AddCreditsModal,
  CreditDisplay,
  InsufficientCredits,
  useAddCreditsModal,
} from "../credits/credit-ui";
import { useCredits } from "../credits/credit-store";
import { assistantsTranslations } from "../translations/assistants";
import { detectLanguage } from "../utils/language";
import type {
  FinalPackage,
  MarketingBackgroundMode,
  MarketingImageModel,
  MarketingPlatformFormat,
  MarketingResult,
  MarketingStatus,
} from "./types";

interface SavedMarketingCampaign extends MarketingResult {
  id: string;
  savedAt: string;
  reminderNote?: string;
}

const storageKey = "emovel-assistants-marketing-campaigns";

type Language = Extract<keyof typeof assistantsTranslations, string>;

function getSupportedLanguage(language: string): Language {
  return language in assistantsTranslations ? language : "en";
}

function subscribeToLanguageChange(onStoreChange: () => void) {
  window.addEventListener("languagechange", onStoreChange);

  return () => {
    window.removeEventListener("languagechange", onStoreChange);
  };
}

function getLanguageSnapshot(): Language {
  return getSupportedLanguage(detectLanguage());
}

function useMarketingCopy() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    () => "en",
  );

  return assistantsTranslations[language].marketing;
}

const backgroundModes: MarketingBackgroundMode[] = [
  "cinematic-dark",
  "luxury-gradient",
  "product-studio",
  "clean-white",
  "transparent-style",
];

const platformFormats: MarketingPlatformFormat[] = [
  "Instagram/Facebook Post",
  "Story/Reel Cover",
  "Square Product Ad",
];

const formatSizes: Record<MarketingPlatformFormat, string> = {
  "Instagram/Facebook Post": "1080x1080",
  "Story/Reel Cover": "1080x1920",
  "Square Product Ad": "1080x1080",
};

const backgroundLabels: Record<MarketingBackgroundMode, string> = {
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

function createMarketingResult(input: string, result: FinalPackage): MarketingResult {
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

function createImageModel(
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

function readCampaigns(): SavedMarketingCampaign[] {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as SavedMarketingCampaign[]) : [];
  } catch {
    return [];
  }
}

function writeCampaigns(campaigns: SavedMarketingCampaign[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(campaigns));
}

function VisualCard({
  label,
  ratio,
  result,
  imageModel,
}: {
  label: string;
  ratio: string;
  result: MarketingResult;
  imageModel: MarketingImageModel | null;
}) {
  return (
    <div className="border border-white/[0.08] bg-black/30 p-4">
      <div className={`relative overflow-hidden border border-white/[0.1] bg-[#090909] ${ratio}`}>
        <div
          className={`absolute inset-5 border border-white/[0.08] ${
            imageModel?.backgroundMode === "clean-white"
              ? "bg-white"
              : imageModel?.backgroundMode === "product-studio"
                ? "bg-stone-900"
                : imageModel?.backgroundMode === "luxury-gradient"
                  ? "bg-[linear-gradient(135deg,#090909,#2b2114,#0d0d0d)]"
                  : imageModel?.backgroundMode === "transparent-style"
                    ? "bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:24px_24px]"
                    : "bg-white/[0.025]"
          }`}
        />
        <div className="relative flex h-full flex-col justify-between p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4C08A]/75">
            EMOVEL MARKETING
          </p>
          <div>
            <h4 className="max-w-xs text-2xl font-semibold tracking-tight text-white">
              {result.campaignTitle}
            </h4>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
            {result.cta}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MarketingOutputSystem({
  input,
  result,
}: {
  input: string;
  result: FinalPackage;
}) {
  const copy = useMarketingCopy();
  const { credits, costs, canAfford, spendCredits } = useCredits();
  const addCreditsModal = useAddCreditsModal();
  const [marketingResult, setMarketingResult] = useState<MarketingResult | null>(null);
  const [imageModel, setImageModel] = useState<MarketingImageModel | null>(null);
  const [savedCampaigns, setSavedCampaigns] = useState<SavedMarketingCampaign[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B">("A");
  const [statusMessage, setStatusMessage] = useState(copy.ready);

  const sourceKey = useMemo(() => `${input}-${result.timestamp}`, [input, result.timestamp]);

  useEffect(() => {
    setSavedCampaigns(readCampaigns());
  }, []);

  useEffect(() => {
    setMarketingResult(null);
    setImageModel(null);
    setSelectedVariant("A");
    setStatusMessage(copy.ready);
  }, [copy.ready, sourceKey]);

  function generateSocialPack() {
    if (!spendCredits("marketing-social-pack-generation")) {
      setStatusMessage(copy.insufficientCredits);
      addCreditsModal.showAddCredits();
      return;
    }

    const nextResult = createMarketingResult(input, result);

    setMarketingResult(nextResult);
    setImageModel(createImageModel(nextResult, "Instagram/Facebook Post", "cinematic-dark"));
    setStatusMessage(copy.generated);
  }

  function updateImageModel(
    platformFormat: MarketingPlatformFormat,
    backgroundMode: MarketingBackgroundMode,
  ) {
    if (!marketingResult) {
      return;
    }

    setImageModel(createImageModel(marketingResult, platformFormat, backgroundMode));
  }

  async function copyCaption() {
    if (!marketingResult) {
      return;
    }

    await navigator.clipboard.writeText(
      `${marketingResult.caption}\n\n${marketingResult.hashtags.join(" ")}\n\n${marketingResult.cta}`,
    );
    setStatusMessage(copy.captionCopied);
  }

  function saveCampaign(status: MarketingStatus = "draft", reminderNote?: string) {
    if (!marketingResult) {
      return;
    }

    const saved: SavedMarketingCampaign = {
      ...marketingResult,
      status,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      reminderNote,
    };
    const nextCampaigns = [saved, ...savedCampaigns].slice(0, 12);

    writeCampaigns(nextCampaigns);
    setSavedCampaigns(nextCampaigns);
    setMarketingResult(saved);
    setStatusMessage(
      status === "scheduled"
        ? copy.scheduled
        : copy.saved,
    );
  }

  async function copyVisualPrompt() {
    if (!imageModel) {
      return;
    }

    await navigator.clipboard.writeText(imageModel.visualPrompt);
    setStatusMessage(copy.promptCopied);
  }

  return (
    <div className="border border-[#D4C08A]/20 bg-[#D4C08A]/[0.035] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4C08A]/70">
            {copy.eyebrow}
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {copy.headline}
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {copy.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <CreditDisplay
            balance={credits.balance}
            action="marketing-social-pack-generation"
            compact
          />
          <button
            type="button"
            onClick={generateSocialPack}
            disabled={!canAfford("marketing-social-pack-generation")}
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
          >
            {copy.generate} ({costs["marketing-social-pack-generation"].estimatedCreditCost} credits)
          </button>
        </div>
      </div>

      {!canAfford("marketing-social-pack-generation") ? (
        <div className="mt-6">
          <InsufficientCredits
            action="marketing-social-pack-generation"
            onAddCredits={addCreditsModal.showAddCredits}
          />
        </div>
      ) : null}

      {marketingResult ? (
        <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.82fr]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedVariant("A")}
                className={`text-left ${selectedVariant === "A" ? "outline outline-1 outline-white/40" : ""}`}
              >
                <VisualCard
                  label={marketingResult.visualVariantA}
                  ratio="aspect-square"
                  result={marketingResult}
                  imageModel={imageModel}
                />
              </button>
              <button
                type="button"
                onClick={() => setSelectedVariant("B")}
                className={`text-left ${selectedVariant === "B" ? "outline outline-1 outline-white/40" : ""}`}
              >
                <VisualCard
                  label={marketingResult.visualVariantB}
                  ratio="aspect-[9/16]"
                  result={marketingResult}
                  imageModel={imageModel}
                />
              </button>
            </div>

            {imageModel ? (
              <div className="border border-white/[0.08] bg-black/30 p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                      {copy.visualPrep}
                    </p>
                    <h4 className="mt-3 text-xl font-semibold text-white">
                      {copy.visualPrepTitle}
                    </h4>
                  </div>
                  <span className="w-fit border border-[#D4C08A]/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4C08A]/75">
                    {imageModel.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                      {copy.backgroundMode}
                    </span>
                    <select
                      value={imageModel.backgroundMode}
                      onChange={(event) =>
                        updateImageModel(
                          imageModel.platformFormat,
                          event.target.value as MarketingBackgroundMode,
                        )
                      }
                      className="w-full border border-white/[0.08] bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                    >
                      {backgroundModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {backgroundLabels[mode]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                      {copy.format}
                    </span>
                    <select
                      value={imageModel.platformFormat}
                      onChange={(event) =>
                        updateImageModel(
                          event.target.value as MarketingPlatformFormat,
                          imageModel.backgroundMode,
                        )
                      }
                      className="w-full border border-white/[0.08] bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                    >
                      {platformFormats.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
                  <p>{copy.style}: {imageModel.stylePreset}</p>
                  <p>{copy.size}: {imageModel.size}</p>
                  <p>{copy.status}: {imageModel.status}</p>
                </div>

                <div className="mt-5 border border-white/[0.08] bg-white/[0.025] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    {copy.visualPrompt}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {imageModel.visualPrompt}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
                  >
                    {copy.generateImage}
                  </button>
                  <button
                    type="button"
                    onClick={copyVisualPrompt}
                    className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
                  >
                    {copy.copyPrompt}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!imageModel?.imageUrl}
                className="cursor-not-allowed border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
              >
                {copy.downloadImage}
              </button>
              <button
                type="button"
                onClick={copyCaption}
                className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
              >
                {copy.copyCaption}
              </button>
              <button
                type="button"
                onClick={() => saveCampaign("draft")}
                className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
              >
                {copy.saveCampaign}
              </button>
              <button
                type="button"
                onClick={() => saveCampaign("scheduled", "Local reminder only. No social publishing is connected.")}
                className="bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-slate-200"
              >
                {copy.publishLater}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="border border-white/[0.08] bg-black/30 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                {copy.campaign}
              </p>
              <h4 className="mt-3 text-xl font-semibold text-white">
                {marketingResult.campaignTitle}
              </h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">{marketingResult.caption}</p>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                {marketingResult.hashtags.join(" ")}
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-400">
                <p>{copy.platform}: {marketingResult.platform}</p>
                <p>{copy.format}: {marketingResult.format}</p>
                <p>{copy.status}: {marketingResult.status}</p>
                <p>{copy.cta}: {marketingResult.cta}</p>
              </div>
            </div>

            <div className="border border-white/[0.08] bg-black/30 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                {copy.localDrafts}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{statusMessage}</p>
              <div className="mt-4 space-y-3">
                {savedCampaigns.length === 0 ? (
                  <p className="text-sm text-slate-500">{copy.noDrafts}</p>
                ) : (
                  savedCampaigns.slice(0, 4).map((campaign) => (
                    <div key={campaign.id} className="border border-white/[0.08] p-3">
                      <p className="text-sm font-medium text-white">{campaign.campaignTitle}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {campaign.status} / {new Date(campaign.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 border border-white/[0.08] bg-black/25 p-5 text-sm leading-7 text-slate-400">
          {copy.emptyState}
        </div>
      )}
      <AddCreditsModal open={addCreditsModal.open} onClose={addCreditsModal.hideAddCredits} />
    </div>
  );
}
