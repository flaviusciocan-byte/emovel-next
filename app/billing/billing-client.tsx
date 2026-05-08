"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthSession } from "../../lib/auth/use-auth-session";

interface BillingResponse {
  url?: string;
  error?: string;
  code?: string;
}

function billingErrorCopy(data?: BillingResponse | null) {
  const map: Record<string, string> = {
    AUTH_REQUIRED: "Sign in before managing billing.",
    STRIPE_CONFIG_MISSING: "Billing is not configured yet.",
    STRIPE_CUSTOMER_REQUIRED: "Upgrade to Pro before opening the customer portal.",
    STRIPE_CHECKOUT_FAILED: "Stripe checkout failed. Try again shortly.",
    STRIPE_PORTAL_FAILED: "Stripe customer portal failed. Try again shortly.",
  };

  return (data?.code ? map[data.code] : null) || data?.error || "Billing request failed.";
}

export default function BillingClient() {
  const { authenticated, loading, token, plan, subscription, refresh } = useAuthSession();
  const [status, setStatus] = useState("Choose the billing action that matches your account state.");
  const [busy, setBusy] = useState(false);

  async function requestBillingUrl(endpoint: "/api/stripe/checkout" | "/api/stripe/customer-portal") {
    if (!token) {
      setStatus("Sign in before managing billing.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json().catch(() => null)) as BillingResponse | null;

      if (!response.ok || !data?.url) {
        setStatus(billingErrorCopy(data));
        return;
      }

      await refresh();
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-[#030405] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Billing</p>
          <h1 className="mt-4 text-4xl font-semibold">Loading account...</h1>
        </div>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="min-h-[70vh] bg-[#030405] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl border border-white/10 bg-black/25 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Billing</p>
          <h1 className="mt-4 text-4xl font-semibold">Sign in to manage billing</h1>
          <Link
            href="/auth"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.16em] text-black"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] bg-[#030405] px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Billing</p>
        <h1 className="mt-4 text-4xl font-semibold">EMOVEL account plan</h1>
        <div className="mt-10 grid gap-5 border border-white/10 bg-black/25 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Current Plan</p>
            <p className="mt-3 text-3xl font-semibold">{plan === "pro" ? "Pro" : "Free"}</p>
            <p className="mt-3 text-sm leading-7 text-white/55">
              {plan === "pro"
                ? "PDF export is unlocked for persisted Builder projects."
                : "Upgrade to Pro to unlock private PDF export."}
            </p>
          </div>
          {subscription ? (
            <div className="grid gap-2 text-sm leading-7 text-white/55">
              <p>Status: {subscription.status}</p>
              {subscription.current_period_end ? <p>Current period ends: {subscription.current_period_end}</p> : null}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => requestBillingUrl("/api/stripe/checkout")}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:bg-white/25"
            >
              Upgrade to Pro
            </button>
            <button
              type="button"
              disabled={busy || !subscription?.stripe_customer_id}
              onClick={() => requestBillingUrl("/api/stripe/customer-portal")}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/35"
            >
              Manage Billing
            </button>
          </div>
          <p className="text-xs leading-6 text-white/45">{status}</p>
        </div>
      </div>
    </section>
  );
}
