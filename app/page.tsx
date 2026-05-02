import Image from "next/image";

const productCards = [
  {
    title: "Signal Capture",
    description:
      "Map the moments where attention turns into intent, then route every lead into the right next move.",
  },
  {
    title: "Conversion Engine",
    description:
      "Replace scattered prompts with repeatable journeys that qualify, nurture, and close with precision.",
  },
  {
    title: "Operating Layer",
    description:
      "Give your team one system for visibility, accountability, and compounding performance.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030405] text-slate-100">
      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-white/[0.07] px-6 py-24 sm:py-32 lg:px-10">
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

        <div className="relative z-10 mx-auto mt-8 flex w-full max-w-6xl -translate-x-0 flex-col items-start gap-16 lg:-translate-x-8">
          <p className="text-sm font-medium uppercase tracking-[0.48em] text-slate-500">
            EMOVEL
          </p>

          <div className="max-w-[760px]">
            <h1 className="text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build Systems That Convert
            </h1>
            <p className="mt-8 text-lg font-medium uppercase tracking-[0.32em] text-slate-400">
              Not Tools. Systems.
            </p>
          </div>

          <a
            href="#start"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:border-white/40 hover:bg-white hover:text-black"
          >
            Start Now
          </a>
        </div>
      </section>

      <section className="border-b border-white/[0.07] px-6 py-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.7fr_1fr]">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Most AI Setups Fail
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            They start with features instead of flow. EMOVEL designs the
            strategic layer between AI capability and revenue performance, then
            builds the system around the conversion path.
          </p>
        </div>
      </section>

      <section className="border-b border-white/[0.07] bg-[#07090b] px-6 py-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.7fr_1fr]">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            This Is Not Another Tool
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Tools wait for commands. Systems create leverage. EMOVEL connects
            positioning, process, automation, and measurement into one operating
            layer.
          </p>
        </div>
      </section>

      <section className="border-b border-white/[0.07] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Product Layer
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Built Around the Work That Moves Revenue
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {productCards.map((card) => (
              <article
                key={card.title}
                className="border border-white/[0.08] bg-white/[0.025] p-8"
              >
                <h3 className="text-2xl font-semibold text-white">
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

      <section id="start" className="px-6 py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 border border-white/[0.1] bg-white/[0.025] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Final CTA
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Turn AI into a system your business can trust.
            </h2>
          </div>
          <a
            href="mailto:hello@emovel.com"
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-[0.22em] text-black hover:bg-slate-200"
          >
            Start Now
          </a>
        </div>
      </section>
    </main>
  );
}
