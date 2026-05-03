"use client";

import { useEffect, useMemo, useState } from "react";
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
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
  const [marketingResult, setMarketingResult] = useState<MarketingResult | null>(null);
  const [imageModel, setImageModel] = useState<MarketingImageModel | null>(null);
  const [savedCampaigns, setSavedCampaigns] = useState<SavedMarketingCampaign[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B">("A");
  const [statusMessage, setStatusMessage] = useState("Ready to generate a local Social Pack.");

  const sourceKey = useMemo(() => `${input}-${result.timestamp}`, [input, result.timestamp]);

  useEffect(() => {
    setSavedCampaigns(readCampaigns());
  }, []);

  useEffect(() => {
    setMarketingResult(null);
    setImageModel(null);
    setSelectedVariant("A");
    setStatusMessage("Ready to generate a local Social Pack.");
  }, [sourceKey]);

  function generateSocialPack() {
    const nextResult = createMarketingResult(input, result);

    setMarketingResult(nextResult);
    setImageModel(createImageModel(nextResult, "Instagram/Facebook Post", "cinematic-dark"));
    setStatusMessage("Social Pack generated as a local draft.");
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
    setStatusMessage("Caption copied to clipboard.");
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
        ? "Publish Later saved as a local reminder only."
        : "Campaign saved locally.",
    );
  }

  async function copyVisualPrompt() {
    if (!imageModel) {
      return;
    }

    await navigator.clipboard.writeText(imageModel.visualPrompt);
    setStatusMessage("Visual prompt copied to clipboard.");
  }

  return (
    <div className="border border-emerald-200/15 bg-emerald-200/[0.035] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/60">
            Marketing Output System
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Generate a Social Pack from the Marketing assistant.
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            V1 creates two local visual variants, caption, hashtags, CTA, campaign metadata,
            and draft actions. No live publishing or platform integrations are connected.
          </p>
        </div>

        <button
          type="button"
          onClick={generateSocialPack}
          className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-slate-200"
        >
          Generate Social Pack
        </button>
      </div>

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
                      Image Generation Prep
                    </p>
                    <h4 className="mt-3 text-xl font-semibold text-white">
                      Professional image request model
                    </h4>
                  </div>
                  <span className="w-fit border border-emerald-200/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
                    {imageModel.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                      Background Mode
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
                      Format
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
                  <p>Style: {imageModel.stylePreset}</p>
                  <p>Size: {imageModel.size}</p>
                  <p>Status: {imageModel.status}</p>
                </div>

                <div className="mt-5 border border-white/[0.08] bg-white/[0.025] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Visual Prompt
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
                    Generate Professional Image
                  </button>
                  <button
                    type="button"
                    onClick={copyVisualPrompt}
                    className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
                  >
                    Copy Prompt
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
                Download Image
              </button>
              <button
                type="button"
                onClick={copyCaption}
                className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
              >
                Copy Caption
              </button>
              <button
                type="button"
                onClick={() => saveCampaign("draft")}
                className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
              >
                Save Campaign
              </button>
              <button
                type="button"
                onClick={() => saveCampaign("scheduled", "Local reminder only. No social publishing is connected.")}
                className="bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-slate-200"
              >
                Publish Later
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="border border-white/[0.08] bg-black/30 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Campaign
              </p>
              <h4 className="mt-3 text-xl font-semibold text-white">
                {marketingResult.campaignTitle}
              </h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">{marketingResult.caption}</p>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                {marketingResult.hashtags.join(" ")}
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-400">
                <p>Platform: {marketingResult.platform}</p>
                <p>Format: {marketingResult.format}</p>
                <p>Status: {marketingResult.status}</p>
                <p>CTA: {marketingResult.cta}</p>
              </div>
            </div>

            <div className="border border-white/[0.08] bg-black/30 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Local Drafts
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{statusMessage}</p>
              <div className="mt-4 space-y-3">
                {savedCampaigns.length === 0 ? (
                  <p className="text-sm text-slate-500">No saved campaigns yet.</p>
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
          Generate the Social Pack after reviewing the assistant output. Saved campaigns remain
          local to this browser.
        </div>
      )}
    </div>
  );
}
