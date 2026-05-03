"use client";

import { useState } from "react";
import type { CreditAction } from "./types";
import { CREDIT_COSTS } from "./credit-store";

export function CreditDisplay({
  balance,
  action,
  compact = false,
}: {
  balance: number;
  action: CreditAction;
  compact?: boolean;
}) {
  const cost = CREDIT_COSTS[action];

  return (
    <div
      className={`border border-white/[0.08] bg-black/25 ${
        compact ? "px-4 py-3" : "p-5"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
        Credits
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <p className="text-2xl font-semibold text-white">{balance}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Cost: {cost.estimatedCreditCost}
        </p>
      </div>
      <div className="mt-3 border-t border-white/[0.08] pt-3 text-xs leading-5 text-slate-500">
        <p>Optimized model route: {cost.modelTier.charAt(0).toUpperCase() + cost.modelTier.slice(1)}</p>
        <p>Estimated cost: {cost.estimatedCreditCost} credits</p>
      </div>
    </div>
  );
}

export function InsufficientCredits({
  action,
  onAddCredits,
}: {
  action: CreditAction;
  onAddCredits: () => void;
}) {
  const cost = CREDIT_COSTS[action];

  return (
    <div className="border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-amber-50">Not enough credits.</p>
          <p className="mt-1 text-amber-100/80">
            {cost.label} requires {cost.estimatedCreditCost} credits on the{" "}
            {cost.modelTier} route. Add credits to continue.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCredits}
          className="w-fit bg-amber-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-white"
        >
          Add Credits
        </button>
      </div>
    </div>
  );
}

export function AddCreditsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-lg border border-white/[0.1] bg-[#080808] p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Add Credits
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Credit purchase placeholder
        </h3>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Payments are not connected yet. In production this modal will route to a secure
          checkout and update the server-side credit ledger after payment confirmation.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[25, 100, 250].map((amount) => (
            <button
              key={amount}
              type="button"
              disabled
              className="cursor-not-allowed border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-left"
            >
              <span className="block text-lg font-semibold text-white/40">{amount}</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-slate-600">
                Disabled
              </span>
            </button>
          ))}
        </div>
        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:border-white/35"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function useAddCreditsModal() {
  const [open, setOpen] = useState(false);

  return {
    open,
    showAddCredits: () => setOpen(true),
    hideAddCredits: () => setOpen(false),
  };
}
