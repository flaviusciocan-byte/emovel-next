"use client";

import { useMemo, useState } from "react";
import { GENERATION_ROUTES } from "./model-routing";
import type { CreditAction, CreditCost, UserCreditBalance } from "./types";

const storageKey = "emovel-credit-balance";
const startingCredits = 50;

export const CREDIT_COSTS: Record<CreditAction, CreditCost> = GENERATION_ROUTES;

function readBalance(): UserCreditBalance {
  try {
    const saved = window.localStorage.getItem(storageKey);
    const parsed = saved ? Number.parseInt(saved, 10) : startingCredits;

    return {
      balance: Number.isFinite(parsed) ? parsed : startingCredits,
      currency: "credits",
    };
  } catch {
    return {
      balance: startingCredits,
      currency: "credits",
    };
  }
}

function writeBalance(balance: number) {
  window.localStorage.setItem(storageKey, String(balance));
}

export function useCredits() {
  const [credits, setCredits] = useState<UserCreditBalance>(() => readBalance());
  const loaded = true;

  const canAfford = useMemo(
    () => (action: CreditAction) =>
      credits.balance >= CREDIT_COSTS[action].estimatedCreditCost,
    [credits.balance],
  );

  function spendCredits(action: CreditAction) {
    const cost = CREDIT_COSTS[action].estimatedCreditCost;

    if (credits.balance < cost) {
      return false;
    }

    const nextBalance = credits.balance - cost;
    setCredits({ balance: nextBalance, currency: "credits" });
    writeBalance(nextBalance);

    return true;
  }

  return {
    credits,
    loaded,
    costs: CREDIT_COSTS,
    canAfford,
    spendCredits,
  };
}
