"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthSession } from "../../../lib/auth/use-auth-session";

interface BrandProfileForm {
  brand_name: string;
  audience: string;
  tone: string;
  visual_direction: string;
  offer_positioning: string;
}

const emptyForm: BrandProfileForm = {
  brand_name: "",
  audience: "",
  tone: "",
  visual_direction: "",
  offer_positioning: "",
};

function fieldClass() {
  return "w-full border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35";
}

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

export default function BrandProfileClient() {
  const { token, loading, refresh } = useAuthSession();
  const [form, setForm] = useState<BrandProfileForm>(emptyForm);
  const [status, setStatus] = useState(
    "Sign in to save your Brand Profile and connect it to your EMOVEL workspace.",
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (loading || !token) {
      return;
    }
    const sessionToken = token;

    async function loadProfile() {
      try {
        const response = await fetch("/api/onboarding/brand-profile", {
          headers: authHeaders(sessionToken),
        });

        if (!response.ok) {
          throw new Error("Unable to load Brand Profile.");
        }

        const data = (await response.json()) as {
          brandProfile?: Partial<BrandProfileForm> | null;
        };

        if (data.brandProfile) {
          setForm({
            brand_name: data.brandProfile.brand_name || "",
            audience: data.brandProfile.audience || "",
            tone: data.brandProfile.tone || "",
            visual_direction: data.brandProfile.visual_direction || "",
            offer_positioning: data.brandProfile.offer_positioning || "",
          });
        }

        setStatus("Complete the profile once. EMOVEL will use it as persistent context.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Brand Profile is unavailable.");
      }
    }

    void loadProfile();
  }, [loading, token]);

  function updateField(key: keyof BrandProfileForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile() {
    if (!token) {
      setStatus("Sign in before saving your Brand Profile.");
      return;
    }

    if (!form.brand_name.trim()) {
      setStatus("Brand name is required.");
      return;
    }

    setIsSaving(true);
    setStatus("Saving Brand Profile...");

    try {
      const response = await fetch("/api/onboarding/brand-profile", {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to save Brand Profile.");
      }

      await refresh();
      window.location.href = "/builder";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Brand Profile save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!loading && !token) {
    return (
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/40">
            Brand Profile
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Sign in to continue.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Brand Profile is connected to your EMOVEL workspace and requires an authenticated session.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-white/85"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/40">
          Brand Profile
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Define the context Builder should remember.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
          This is the first persistent layer for EMOVEL AI V1: audience, tone, visual
          direction, and offer positioning connected to your personal workspace.
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="grid gap-5">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Brand Name
            </span>
            <input
              value={form.brand_name}
              onChange={(event) => updateField("brand_name", event.target.value)}
              className={fieldClass()}
              placeholder="EMOVEL"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Audience
            </span>
            <textarea
              value={form.audience}
              onChange={(event) => updateField("audience", event.target.value)}
              rows={3}
              className={`${fieldClass()} resize-none leading-7`}
              placeholder="Who the product serves and what they need to decide."
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Tone
            </span>
            <input
              value={form.tone}
              onChange={(event) => updateField("tone", event.target.value)}
              className={fieldClass()}
              placeholder="Premium, calm, editorial, commercial."
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Visual Direction
            </span>
            <textarea
              value={form.visual_direction}
              onChange={(event) => updateField("visual_direction", event.target.value)}
              rows={3}
              className={`${fieldClass()} resize-none leading-7`}
              placeholder="Black dominant, white clarity, cinematic gold accents."
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Offer Positioning
            </span>
            <textarea
              value={form.offer_positioning}
              onChange={(event) => updateField("offer_positioning", event.target.value)}
              rows={4}
              className={`${fieldClass()} resize-none leading-7`}
              placeholder="What the offer sells, why it matters, and how it should convert."
            />
          </label>
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={isSaving || !token}
          className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-white px-7 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/40"
        >
          {isSaving ? "Saving..." : "Save Brand Profile"}
        </button>
        <p className="mt-5 text-sm leading-7 text-white/55">{status}</p>
      </div>
    </section>
  );
}
