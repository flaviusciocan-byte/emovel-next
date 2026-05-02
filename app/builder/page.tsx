import { createPageMetadata } from "../seo";
import BuilderClient from "./builder-client";
import BuilderHeroCta from "./builder-hero-cta";

export const metadata = createPageMetadata({
  title: "EMOVEL Builder — Design Your System",
  description:
    "Structure your product logic, define execution layers, and turn raw ideas into controlled digital systems.",
  path: "/builder",
});

export default function Builder() {
  return (
    <main className="min-h-screen bg-[#030405] text-slate-100">
      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-white/[0.07] px-6 pt-24 pb-32 sm:pt-28 sm:pb-40 lg:px-10">
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-6xl -translate-x-0 flex-col items-start gap-16 lg:-translate-x-8">
          <p className="text-sm font-medium uppercase tracking-[0.48em] text-slate-500">
            BUILDER
          </p>

          <div className="max-w-[760px]">
            <h1 className="text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Design your digital product system.
            </h1>
            <p className="mt-8 text-lg font-medium uppercase tracking-[0.32em] text-slate-400">
              Turn a product idea into a structured page, offer flow, and launch-ready asset.
            </p>
          </div>

          <BuilderHeroCta label="Start Building" />
        </div>
      </section>

      <BuilderClient />

      <section className="px-6 py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 border border-white/[0.1] bg-white/[0.025] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Final CTA
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Prepare a controlled digital product system.
            </h2>
          </div>
          <a
            href="mailto:hello@emovel.com"
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-[0.22em] text-black hover:bg-slate-200"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
