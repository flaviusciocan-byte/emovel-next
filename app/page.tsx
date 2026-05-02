import Image from "next/image";
import { useEffect, useState } from "react";
import { detectLanguage } from "@/utils/language";
import { homeTranslations } from "@/translations/home";

const productCards = [
  {
    title: "Product Architecture",
    description:
      "Define the structure, logic, and commercial shape before execution begins.",
  },
  {
    title: "Prompt Systems",
    description:
      "Turn repeatable thinking into controlled inputs, outputs, and workflows.",
  },
  {
    title: "Commercial Assets",
    description:
      "Connect assistants, documentation, and interfaces to a monetizable path.",
  },
];

const systemShifts = [
  "From random output to structured execution.",
  "From isolated tools to operating layers.",
  "From visual experiments to monetizable digital assets.",
];

export default function Home() {
  const [language, setLanguage] = useState(detectLanguage());

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <main className="min-h-screen bg-[#030405] text-slate-100">
      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-white/[0.07] px-6 pt-10 pb-24 sm:pt-14 sm:pb-28 lg:px-10">
        <Image
          src="/assets/backgrounds/home-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl -translate-x-0 flex-col items-start gap-12 lg:-translate-x-8">
          <p className="text-sm font-medium uppercase tracking-[0.48em] text-slate-500">
            {homeTranslations[language].eyebrow}
          </p>

          <div className="max-w-[760px]">
            <h1 className="text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {homeTranslations[language].headline}
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300 sm:text-2xl sm:leading-9">
              Turn ideas into structured, monetizable digital products — not
              tools, but controlled systems.
            </p>
          </div>

          <a
            href="#start"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-white/40 hover:bg-white hover:text-black"
          >
            {homeTranslations[language].cta}
          </a>
        </div>
      </section>

      <section className="border-b border-white/[0.07] px-6 py-24 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            Problem
          </p>
          <div>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Most digital projects fail because they are built as isolated
              pages, prompts, tools, or templates.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              EMOVEL turns scattered execution into a controlled system.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.07] bg-[#07090b] px-6 py-24 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            System Shift
          </p>
          <div className="grid gap-5">
            {systemShifts.map((shift) => (
              <p
                key={shift}
                className="border-b border-white/[0.08] pb-5 text-2xl font-medium leading-9 tracking-tight text-white sm:text-3xl sm:leading-10"
              >
                {shift}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.07] px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Product Layer
            </p>
            <div>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                EMOVEL connects product architecture, prompt systems,
                assistants, documentation, and commercial assets into one
                premium execution ecosystem.
              </h2>
            </div>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {productCards.map((card) => (
              <article
                key={card.title}
                className="border border-white/[0.08] bg-white/[0.025] p-8"
              >
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-5 leading-7 text-slate-300">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.07] bg-[#07090b] px-6 py-24 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
            Proof / Logic
          </p>
          <div>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A product is not valuable because it exists.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              It becomes valuable when the idea, structure, offer, interface,
              and conversion path work together.
            </p>
          </div>
        </div>
      </section>

      <section id="start" className="px-6 py-24 sm:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 border border-white/[0.1] bg-white/[0.025] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Final CTA
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Enter The EMOVEL System
            </h2>
          </div>
          <a
            href="mailto:hello@emovel.com"
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-[0.22em] text-black hover:bg-slate-200"
          >
            Enter The System
          </a>
        </div>
      </section>
    </main>
  );
}
