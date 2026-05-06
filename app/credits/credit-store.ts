"use client";

import { useEffect, useMemo, useState } from "react";
import { GENERATION_ROUTES } from "./model-routing";
import type { CreditAction, CreditCost, UserCreditBalance } from "./types";

const storageKey = "emovel-credit-balance";
const startingCredits = 100;
const localDevelopmentMinimumCredits = 100;

export const CREDIT_COSTS: Record<CreditAction, CreditCost> = GENERATION_ROUTES;

function isLocalDevelopmentHost() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function resolveLocalDevelopmentBalance(balance: number) {
  if (!isLocalDevelopmentHost() || balance >= localDevelopmentMinimumCredits) {
    return balance;
  }

  writeBalance(localDevelopmentMinimumCredits);

  return localDevelopmentMinimumCredits;
}

function readBalance(): UserCreditBalance {
  try {
    const saved = window.localStorage.getItem(storageKey);
    const parsed = saved ? Number.parseInt(saved, 10) : startingCredits;
    const balance = Number.isFinite(parsed) ? parsed : startingCredits;

    return {
      balance: resolveLocalDevelopmentBalance(balance),
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
  const [credits, setCredits] = useState<UserCreditBalance>({
    balance: startingCredits,
    currency: "credits",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCredits(readBalance());
      setLoaded(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

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
