"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useCredits } from "../credits/credit-store";
import {
  marketingSystemTranslations,
  type MarketingSystemTranslation,
} from "../translations/marketing-system";
import { detectLanguage } from "../utils/language";
import {
  backgroundLabels,
  backgroundModes,
  createImageModel,
  createMarketingResult,
  platformLabels,
  platformFormats,
} from "./output-model";
import {
  readCampaigns,
  readMarketingHandoff,
  writeCampaigns,
  type MarketingSystemHandoff,
} from "./storage";
import type { FinalPackage } from "../assistants/types";
import type {
  MarketingBackgroundMode,
  MarketingImageModel,
  MarketingPlatformFormat,
  MarketingResult,
  MarketingStatus,
  SavedMarketingCampaign,
} from "./types";

type Language = Extract<keyof typeof marketingSystemTranslations, string>;

function getSupportedLanguage(language: string): Language {
  return language in marketingSystemTranslations ? language : "en";
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

function useMarketingSystemCopy() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    () => "en",
  );

  return marketingSystemTranslations[language];
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

function createDirectMarketingPackage(input: string): FinalPackage {
  const summary = input.trim().replace(/\s+/g, " ");
  const taskSummary =
    summary.length > 180 ? `${summary.slice(0, 177)}...` : summary;

  return {
    plan: {
      taskSummary: `Cerere directa pentru Marketing System: ${taskSummary}`,
      assignments: [
        {
          assistant: "marketing",
          task: "Construieste pozitionare comerciala premium, structura de campanie, copy social si directie de prompt vizual.",
          order: 1,
        },
      ],
    },
    responses: [
      {
        assistantId: "marketing",
        assistantName: "EMOVEL MARKETING",
        task: "Cerere directa in workspace-ul Marketing System.",
        output: [
          "Mesaj comercial",
          "Pozitioneaza cererea ca asset comercial controlat.",
          "Foloseste limbaj premium, restrans si o cale clara de conversie.",
          `Cerere sursa: ${taskSummary}`,
        ].join("\n"),
      },
    ],
    qualityCheck:
      "Context direct Marketing System. Revizuieste titlul campaniei, captionul, CTA-ul si promptul vizual inainte de productie.",
    timestamp: new Date().toISOString(),
  };
}

function statusLabel(status: string, copy: MarketingSystemTranslation["system"]) {
  if (status === "draft") {
    return copy.draftStatus;
  }

  if (status === "ready") {
    return copy.readyStatus;
  }

  return status;
}

export default function MarketingSystemClient() {
  const copy = useMarketingSystemCopy();
  const pageCopy = copy.page;
  const systemCopy = copy.system;
  const { credits, costs, canAfford, spendCredits, loaded } = useCredits();
  const [handoff, setHandoff] = useState<MarketingSystemHandoff | null>(null);
  const [directInput, setDirectInput] = useState("");
  const [marketingResult, setMarketingResult] = useState<MarketingResult | null>(null);
  const [imageModel, setImageModel] = useState<MarketingImageModel | null>(null);
  const [savedCampaigns, setSavedCampaigns] = useState<SavedMarketingCampaign[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B">("A");
  const [statusMessage, setStatusMessage] = useState(systemCopy.ready);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const sourceKey = useMemo(
    () => (handoff ? `${handoff.input}-${handoff.result.timestamp}` : directInput.trim()),
    [directInput, handoff],
  );
  const hasWorkspaceInput = Boolean(handoff || directInput.trim());
  const canGenerate =
    loaded && hasWorkspaceInput && canAfford("marketing-social-pack-generation");
  const showCreditGate =
    loaded && hasWorkspaceInput && !canAfford("marketing-social-pack-generation");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHandoff(readMarketingHandoff());
      setSavedCampaigns(readCampaigns());
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMarketingResult(null);
      setImageModel(null);
      setSelectedVariant("A");
      setStatusMessage(systemCopy.ready);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sourceKey, systemCopy.ready]);

  function generateSocialPack() {
    if (!handoff && !directInput.trim()) {
      return;
    }

    if (!spendCredits("marketing-social-pack-generation")) {
      setMarketingResult(null);
      setImageModel(null);
      setStatusMessage(systemCopy.insufficientCredits);
      return;
    }

    const sourceInput = handoff?.input || directInput;
    const sourceResult = handoff?.result || createDirectMarketingPackage(directInput);
    const nextResult = createMarketingResult(sourceInput, sourceResult);

    setMarketingResult(nextResult);
    setImageModel(createImageModel(nextResult, "Instagram/Facebook Post", "cinematic-dark"));
    setStatusMessage(systemCopy.generated);
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
    setStatusMessage(systemCopy.captionCopied);
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
        ? systemCopy.scheduled
        : systemCopy.saved,
    );
  }

  async function copyVisualPrompt() {
    if (!imageModel) {
      return;
    }

    await navigator.clipboard.writeText(imageModel.visualPrompt);
    setStatusMessage(systemCopy.promptCopied);
  }

  return (
    <>
      <section className="px-6 py-24 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            {pageCopy.eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.96] tracking-tight text-white sm:text-6xl">
            {pageCopy.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {pageCopy.subheadline}
          </p>
        </div>

        <div className="border border-[#D4C08A]/20 bg-[#D4C08A]/[0.035] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4C08A]/70">
                  {systemCopy.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {systemCopy.headline}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {systemCopy.description}
                </p>
                {handoff ? (
                  <div className="mt-5 border border-white/[0.08] bg-black/25 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4C08A]/75">
                      {systemCopy.contextLoaded}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {handoff.input}
                    </p>
                  </div>
                ) : (
                  <label className="mt-5 block space-y-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {systemCopy.campaignRequest}
                    </span>
                    <textarea
                      value={directInput}
                      onChange={(event) => setDirectInput(event.target.value)}
                      rows={5}
                      placeholder={systemCopy.campaignRequestPlaceholder}
                      className="w-full resize-none border border-white/[0.08] bg-black/35 px-5 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-white/25"
                    />
                  </label>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3">
                <div className="border border-white/[0.08] bg-black/25 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    {systemCopy.creditBalance}
                  </p>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                    <p className="text-2xl font-semibold text-white">{credits.balance}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {systemCopy.costLabel}: {costs["marketing-social-pack-generation"].estimatedCreditCost}
                    </p>
                  </div>
                  <p className="mt-3 border-t border-white/[0.08] pt-3 text-xs leading-5 text-slate-500">
                    {systemCopy.modelRoute}: {costs["marketing-social-pack-generation"].modelTier}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateSocialPack}
                  disabled={!canGenerate}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
                >
                  {systemCopy.generate} ({costs["marketing-social-pack-generation"].estimatedCreditCost} credite)
                </button>
              </div>
            </div>

          {showCreditGate ? (
              <div className="mt-6 border border-[#D4C08A]/35 bg-[#D4C08A]/10 p-5 text-sm leading-6 text-[#F3E3B3]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{systemCopy.insufficientCredits}</p>
                    <p className="mt-1 text-[#F3E3B3]/75">
                      {systemCopy.costLabel}: {costs["marketing-social-pack-generation"].estimatedCreditCost} credite.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreditModalOpen(true)}
                    className="w-fit bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-slate-200"
                  >
                    {systemCopy.addCredits}
                  </button>
                </div>
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
                            {systemCopy.visualPrep}
                          </p>
                          <h3 className="mt-3 text-xl font-semibold text-white">
                            {systemCopy.visualPrepTitle}
                          </h3>
                        </div>
                        <span className="w-fit border border-[#D4C08A]/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4C08A]/75">
                          {statusLabel(imageModel.status, systemCopy)}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                            {systemCopy.backgroundMode}
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
                            {systemCopy.format}
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
                                {platformLabels[format]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="mt-5 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
                        <p>{systemCopy.style}: {imageModel.stylePreset}</p>
                        <p>{systemCopy.size}: {imageModel.size}</p>
                        <p>{systemCopy.status}: {statusLabel(imageModel.status, systemCopy)}</p>
                      </div>

                      <div className="mt-5 border border-white/[0.08] bg-white/[0.025] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                          {systemCopy.visualPrompt}
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
                          {systemCopy.generateImage}
                        </button>
                        <span className="self-center text-xs leading-5 text-slate-500">
                          {systemCopy.promptPrepOnly}
                        </span>
                        <button
                          type="button"
                          onClick={copyVisualPrompt}
                          className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
                        >
                          {systemCopy.copyPrompt}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/35"
                    >
                      {systemCopy.downloadImage}
                    </button>
                    <button
                      type="button"
                      onClick={copyCaption}
                      className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
                    >
                      {systemCopy.copyCaption}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveCampaign("draft")}
                      className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:border-white/35"
                    >
                      {systemCopy.saveCampaign}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveCampaign("draft", systemCopy.localReminderNote)}
                      className="border border-[#D4C08A]/30 bg-[#D4C08A]/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F3E3B3] hover:border-[#D4C08A]/60"
                    >
                      {systemCopy.publishLater}
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="border border-white/[0.08] bg-black/30 p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                      {systemCopy.currentPreview}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {marketingResult.campaignTitle}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{marketingResult.caption}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      {marketingResult.hashtags.join(" ")}
                    </p>
                    <div className="mt-5 grid gap-3 text-sm text-slate-400">
                      <p>{systemCopy.platform}: {marketingResult.platform}</p>
                      <p>{systemCopy.format}: {marketingResult.format}</p>
                      <p>{systemCopy.status}: {statusLabel(marketingResult.status, systemCopy)}</p>
                      <p>{systemCopy.cta}: {marketingResult.cta}</p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="mt-8 border border-white/[0.08] bg-black/25 p-5 text-sm leading-7 text-slate-400">
                {systemCopy.emptyState}
              </div>
            )}

            <div className="mt-8 border border-white/[0.08] bg-black/30 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                {systemCopy.localDrafts}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{statusMessage}</p>
              <div className="mt-4 space-y-3">
                {savedCampaigns.length === 0 ? (
                  <p className="text-sm text-slate-500">{systemCopy.noDrafts}</p>
                ) : (
                  savedCampaigns.slice(0, 4).map((campaign) => (
                    <div key={campaign.id} className="border border-white/[0.08] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4C08A]/70">
                        {systemCopy.savedDraft}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">{campaign.campaignTitle}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {statusLabel(campaign.status, systemCopy)} / {new Date(campaign.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {creditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-lg border border-white/[0.1] bg-[#080808] p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {systemCopy.addCredits}
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {systemCopy.addCreditsTitle}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {systemCopy.addCreditsDescription}
            </p>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() => setCreditModalOpen(false)}
                className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:border-white/35"
              >
                {systemCopy.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
