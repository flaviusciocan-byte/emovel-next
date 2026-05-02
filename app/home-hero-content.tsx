"use client";

import { useEffect, useSyncExternalStore } from "react";
import { homeTranslations } from "./translations/home";
import { detectLanguage } from "./utils/language";

type Language = Extract<keyof typeof homeTranslations, string>;

function getSupportedLanguage(language: string): Language {
  return language in homeTranslations ? language : "en";
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

export default function HomeHeroContent() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    () => "en",
  );
  const copy = homeTranslations[language];

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <>
      <p className="text-sm font-medium uppercase tracking-[0.48em] text-slate-500">
        {copy.eyebrow}
      </p>

      <div className="max-w-[760px]">
        <h1 className="text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {copy.headline}
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300 sm:text-2xl sm:leading-9">
          {copy.subheadline}
        </p>
      </div>

      <a
        href="/builder"
        className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-white/40 hover:bg-white hover:text-black"
      >
        {copy.cta}
      </a>
    </>
  );
}
