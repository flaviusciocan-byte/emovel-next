"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  AddCreditsModal,
  CreditDisplay,
  InsufficientCredits,
  useAddCreditsModal,
} from "../credits/credit-ui";
import { useCredits } from "../credits/credit-store";
import { ASSISTANT_ORDER, ASSISTANTS } from "./profiles";
import MarketingOutputSystem from "./marketing-output-system";
import { runAssistantSystem } from "./orchestrator";
import type { AssistantId, FinalPackage, SystemPhase } from "./types";

const phases: { key: SystemPhase; label: string }[] = [
  { key: "orchestrating", label: "Planning" },
  { key: "executing", label: "Executing" },
  { key: "reviewing", label: "Reviewing" },
  { key: "complete", label: "Complete" },
];

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
  copyText,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  copyText?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden border border-white/[0.08] bg-white/[0.025]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
          {title}
        </span>
        <span className="flex items-center gap-3">
          {copyText ? <CopyButton text={copyText} /> : null}
          <span className="text-sm text-slate-500">{open ? "Close" : "Open"}</span>
        </span>
      </button>
      {open ? <div className="space-y-4 px-6 pb-6">{children}</div> : null}
    </div>
  );
}

function PhaseBar({
  current,
  activeAssistant,
}: {
  current: SystemPhase;
  activeAssistant: AssistantId | null;
}) {
  const currentIndex = phases.findIndex((phase) => phase.key === current);
  const activeProfile = activeAssistant ? ASSISTANTS[activeAssistant] : null;

  return (
    <div className="flex flex-col gap-3">
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
      {current === "executing" && activeProfile ? (
        <p className="text-xs text-slate-400">
          <span style={{ color: activeProfile.color }}>{activeProfile.name}</span>{" "}
          is working.
        </p>
      ) : null}
    </div>
  );
}

export default function AssistantsClient() {
  const { credits, costs, canAfford, spendCredits } = useCredits();
  const addCreditsModal = useAddCreditsModal();
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<SystemPhase>("idle");
  const [activeAssistant, setActiveAssistant] = useState<AssistantId | null>(null);
  const [result, setResult] = useState<FinalPackage | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const isProcessing =
    phase === "orchestrating" || phase === "executing" || phase === "reviewing";

  async function handleRun() {
    if (!input.trim() || isProcessing) {
      return;
    }

    if (!spendCredits("assistants-orchestrator-generation")) {
      setError("Insufficient credits for Assistants orchestration.");
      addCreditsModal.showAddCredits();
      return;
    }

    setError("");
    setResult(null);
    setActiveAssistant(null);

    try {
      const nextResult = await runAssistantSystem(
        input,
        (nextPhase) => setPhase(nextPhase as SystemPhase),
        setActiveAssistant,
      );

      setResult(nextResult);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (caughtError) {
      setPhase("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Assistant system failed.",
      );
    }
  }

  return (
    <section id="start" className="border-b border-white/[0.07] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            Assistant System
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Route one request through specialized EMOVEL execution modules.
          </h2>
        </div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ASSISTANT_ORDER.map((id) => {
            const assistant = ASSISTANTS[id];
            const isActive = activeAssistant === id;

            return (
              <div
                key={id}
                className={`border p-5 ${
                  isActive
                    ? "border-white/30 bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.025]"
                }`}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-black"
                  style={{ backgroundColor: assistant.color }}
                >
                  {assistant.name.replace("EMOVEL ", "").slice(0, 2)}
                </div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: assistant.color }}
                >
                  {assistant.name.replace("EMOVEL ", "")}
                </p>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {assistant.functions[0]}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
          <label
            htmlFor="assistant-request"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
          >
            Request
          </label>
          <textarea
            id="assistant-request"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            placeholder="Example: Create a premium product package for an EMOVEL template shop, including positioning, offer logic, social copy, and quality review."
            className="mt-4 w-full resize-none border border-white/[0.08] bg-black/35 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-white/25"
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <div className="text-xs text-slate-500">{input.length} characters</div>
              <CreditDisplay
                balance={credits.balance}
                action="assistants-orchestrator-generation"
                compact
              />
            </div>
            <button
              type="button"
              onClick={handleRun}
              disabled={
                !input.trim() ||
                isProcessing ||
                !canAfford("assistants-orchestrator-generation")
              }
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-[0.22em] text-black disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
            >
              {isProcessing
                ? "Processing"
                : `Run System (${costs["assistants-orchestrator-generation"].estimatedCreditCost} credits)`}
            </button>
          </div>

          {!canAfford("assistants-orchestrator-generation") ? (
            <div className="mt-5">
              <InsufficientCredits
                action="assistants-orchestrator-generation"
                onAddCredits={addCreditsModal.showAddCredits}
              />
            </div>
          ) : null}
        </div>

        {phase !== "idle" ? (
          <div className="mt-8 flex justify-center">
            <PhaseBar current={phase} activeAssistant={activeAssistant} />
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {result ? (
          <div ref={resultRef} className="mt-10 space-y-5">
            <Section title="Orchestrator Plan">
              <div className="border border-white/[0.08] bg-black/25 p-4">
                <p className="text-sm leading-7 text-slate-200">
                  {result.plan.taskSummary}
                </p>
              </div>
              <div className="space-y-3">
                {result.plan.assignments.map((assignment) => {
                  const assistant = ASSISTANTS[assignment.assistant];

                  return (
                    <div
                      key={`${assignment.assistant}-${assignment.order}`}
                      className="grid gap-3 border border-white/[0.08] bg-white/[0.025] p-4 sm:grid-cols-[4rem_1fr]"
                    >
                      <span
                        className="text-xs font-semibold uppercase tracking-[0.18em]"
                        style={{ color: assistant.color }}
                      >
                        {String(assignment.order).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {assistant.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {assignment.task}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {result.responses.map((response) => {
              const assistant = ASSISTANTS[response.assistantId];

              return (
                <Section
                  key={response.assistantId}
                  title={response.assistantName}
                  copyText={response.output}
                >
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: assistant.color }}
                  >
                    Task
                  </p>
                  <p className="text-sm leading-7 text-slate-400">{response.task}</p>
                  <div className="border border-white/[0.08] bg-black/25 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                      {response.output}
                    </p>
                  </div>
                </Section>
              );
            })}

            {result.responses.some((response) => response.assistantId === "marketing") ? (
              <MarketingOutputSystem input={input} result={result} />
            ) : null}

            <Section title="Quality Review">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {result.qualityCheck}
              </p>
            </Section>
          </div>
        ) : null}
      </div>
      <AddCreditsModal open={addCreditsModal.open} onClose={addCreditsModal.hideAddCredits} />
    </section>
  );
}
