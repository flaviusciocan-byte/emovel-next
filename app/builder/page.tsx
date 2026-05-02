import { createPageMetadata } from "../seo";

export const metadata = createPageMetadata({
  title: "EMOVEL Builder — Design Your System",
  description:
    "Structure your product logic, define execution layers, and turn raw ideas into controlled digital systems.",
  path: "/builder",
});

export default function Builder() {
  return (
    <main className="min-h-screen bg-[#030405] text-slate-100">
      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-white/[0.07] px-6 py-24 sm:py-32 lg:px-10">
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-6xl -translate-x-0 flex-col items-start gap-16 lg:-translate-x-8">
          <p className="text-sm font-medium uppercase tracking-[0.48em] text-slate-500">
            Builder
          </p>

          <div className="max-w-[760px]">
            <h1 className="text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build Your Dream System
            </h1>
            <p className="mt-8 text-lg font-medium uppercase tracking-[0.32em] text-slate-400">
              Create custom solutions tailored to your unique needs.
            </p>
          </div>

          <a
            href="#start"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-white/40 hover:bg-white hover:text-black"
          >
            Get Started
          </a>
        </div>
      </section>

      <section className="border-b border-white/[0.07] px-6 py-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.7fr_1fr]">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Custom Solutions
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Our builder allows you to create custom solutions that fit your specific requirements.
          </p>
        </div>
      </section>

      <section id="start" className="px-6 py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 border border-white/[0.1] bg-white/[0.025] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Final CTA
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Let&apos;s Build Something Amazing.
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
