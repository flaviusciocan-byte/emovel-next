"use client";

import { useRef, useState } from "react";
import { AddCreditsModal, CreditDisplay, InsufficientCredits, useAddCreditsModal } from "../credits/credit-ui";
import { useCredits } from "../credits/credit-store";
import { runPromptEngine } from "./engine";
import type { EnginePhase, FinalPackage, VerificationCheck } from "./types";

const phases: { key: EnginePhase; label: string }[] = [
  { key: "structuring", label: "Structuring" },
  { key: "generating", label: "Generating" },
  { key: "verifying", label: "Verifying" },
  { key: "complete", label: "Complete" },
];

const verificationLabels: Record<keyof FinalPackage["verification"], string> = {
  coherence: "Coherence",
  clarity: "Clarity",
  commercialQuality: "Commercial Quality",
  styleConsistency: "EMOVEL Style",
  contradictions: "No Contradictions",
  wordingOptimization: "Wording Optimized",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300 hover:border-white/30 hover:text-white"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden border border-white/[0.08] bg-white/[0.025]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
          {title}
        </span>
        <span className="text-sm text-slate-500">{open ? "Close" : "Open"}</span>
      </button>
      {open ? <div className="space-y-4 px-6 pb-6">{children}</div> : null}
    </div>
  );
}

function PhaseBar({ current }: { current: EnginePhase }) {
  const currentIndex = phases.findIndex((phase) => phase.key === current);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {phases.map((phase, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <span
            key={phase.key}
            className={`border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] ${
              isPast
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : isCurrent
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-slate-600"
            }`}
          >
            {phase.label}
          </span>
        );
      })}
    </div>
  );
}

function PromptCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/[0.08] bg-black/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
          {label}
        </p>
        <CopyButton text={value} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{value}</p>
    </div>
  );
}

function VerificationBadge({
  label,
  check,
}: {
  label: string;
  check: VerificationCheck;
}) {
  return (
    <div className="border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span
          className={`text-xs font-medium uppercase tracking-[0.18em] ${
            check.pass ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          {check.pass ? "Pass" : "Review"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{check.note}</p>
    </div>
  );
}

export default function PromptEngineClient() {
  const { credits, costs, canAfford, spendCredits } = useCredits();
  const addCreditsModal = useAddCreditsModal();
  const [rawIdea, setRawIdea] = useState("");
  const [phase, setPhase] = useState<EnginePhase>("idle");
  const [result, setResult] = useState<FinalPackage | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const isProcessing =
    phase === "structuring" || phase === "generating" || phase === "verifying";

  async function handleGenerate() {
    if (!rawIdea.trim() || isProcessing) {
      return;
    }

    if (!spendCredits("prompt-engine-generation")) {
      setError("Insufficient credits for Prompt Engine generation.");
      addCreditsModal.showAddCredits();
      return;
    }

    setError("");
    setResult(null);

    try {
      const nextResult = await runPromptEngine(rawIdea, (nextPhase) => {
        setPhase(nextPhase as EnginePhase);
      });

      setResult(nextResult);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (caughtError) {
      setPhase("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to generate prompt package.",
      );
    }
  }

  return (
    <section id="start" className="border-b border-white/[0.07] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            Functional Engine
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Convert raw direction into a controlled prompt package.
          </h2>
        </div>

        <div className="border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
          <label
            htmlFor="raw-idea"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
          >
            Raw idea
          </label>
          <textarea
            id="raw-idea"
            value={rawIdea}
            onChange={(event) => setRawIdea(event.target.value)}
            rows={5}
            placeholder="Example: A premium assistant that turns founder notes into a launch-ready product page, prompt system, and client handoff document."
            className="mt-4 w-full resize-none border border-white/[0.08] bg-black/35 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-white/25"
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <CreditDisplay
              balance={credits.balance}
              action="prompt-engine-generation"
              compact
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!rawIdea.trim() || isProcessing || !canAfford("prompt-engine-generation")}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-[0.22em] text-black disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
            >
              {isProcessing
                ? "Processing"
                : `Generate Package (${costs["prompt-engine-generation"].estimatedCreditCost} credits)`}
            </button>
          </div>

          {!canAfford("prompt-engine-generation") ? (
            <div className="mt-5">
              <InsufficientCredits
                action="prompt-engine-generation"
                onAddCredits={addCreditsModal.showAddCredits}
              />
            </div>
          ) : null}

          <div className="mt-5 flex justify-end">
            {phase !== "idle" ? <PhaseBar current={phase} /> : null}
          </div>
        </div>

        {error ? (
          <div className="mt-8 border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {result ? (
          <div ref={resultRef} className="mt-10 space-y-5">
            <Section title="5-Step Structure">
              {Object.entries(result.structure).map(([key, value]) => (
                <div key={key} className="border border-white/[0.08] bg-black/25 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{value}</p>
                </div>
              ))}
            </Section>

            <Section title="Generated Prompts">
              <PromptCard label="Professional Prompt Long" value={result.prompts.longPrompt} />
              <PromptCard label="Professional Prompt Short" value={result.prompts.shortPrompt} />
              <PromptCard label="Visual Prompt 1" value={result.prompts.visualPrompt1} />
              <PromptCard label="Visual Prompt 2" value={result.prompts.visualPrompt2} />
            </Section>

            <Section title="Professional Verification">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(result.verification).map(([key, check]) => (
                  <VerificationBadge
                    key={key}
                    label={verificationLabels[key as keyof FinalPackage["verification"]]}
                    check={check}
                  />
                ))}
              </div>
            </Section>

            <Section title="Client Checklist">
              <ol className="space-y-3">
                {result.clientChecklist.map((item, index) => (
                  <li key={item} className="flex gap-4 text-sm leading-7 text-slate-200">
                    <span className="text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Recommended Adjustments" defaultOpen={false}>
              <ul className="space-y-3">
                {result.recommendedAdjustments.map((item) => (
                  <li key={item} className="text-sm leading-7 text-slate-200">
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        ) : null}
      </div>
      <AddCreditsModal open={addCreditsModal.open} onClose={addCreditsModal.hideAddCredits} />
    </section>
  );
}
