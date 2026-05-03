import Image from "next/image";
import HomeHeroContent from "./home-hero-content";
import { createPageMetadata } from "./seo";

export const metadata = createPageMetadata({
  title: "EMOVEL — Build Systems That Convert",
  description:
    "Turn ideas into structured, monetizable digital products through controlled systems, prompt logic, assistants, and execution architecture.",
  path: "/",
});

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

const pricingPlans = [
  {
    name: "Starter",
    credits: "250 credits",
    price: "For early product validation",
    description:
      "Build first systems, test prompt logic, and generate focused execution assets.",
    features: ["Prompt Engine access", "Spec Builder exports", "Local campaign drafts"],
  },
  {
    name: "Pro",
    credits: "1,000 credits",
    price: "For active operators",
    description:
      "Run product, marketing, and builder workflows with higher output volume.",
    features: ["Social Pack generation", "Assistant orchestration", "Priority system workflows"],
  },
  {
    name: "System",
    credits: "3,000 credits",
    price: "For commercial execution",
    description:
      "Operate EMOVEL as a repeatable digital product production layer.",
    features: ["Full ecosystem usage", "Advanced image preparation", "Founder-grade output memory"],
  },
];

const creditPacks = [
  { name: "Focus Pack", credits: "100 credits", use: "For single-session generation" },
  { name: "Launch Pack", credits: "500 credits", use: "For product and campaign work" },
  { name: "Scale Pack", credits: "2,000 credits", use: "For recurring system execution" },
];

export default function Home() {
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
          <HomeHeroContent />
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

      <section className="border-b border-white/[0.07] px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
            <p className="text-sm font-medium uppercase tracking-[0.36em] text-slate-500">
              Pricing
            </p>
            <div>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Credits turn EMOVEL into a controlled production system.
              </h2>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
                Choose a plan for ongoing execution or add credit packs when a launch cycle needs more output.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className="flex min-h-[420px] flex-col justify-between border border-white/[0.08] bg-white/[0.025] p-8"
              >
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
                    {plan.name}
                  </p>
                  <h3 className="mt-5 text-4xl font-semibold tracking-tight text-white">
                    {plan.credits}
                  </h3>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500">
                    {plan.price}
                  </p>
                  <p className="mt-6 leading-7 text-slate-300">{plan.description}</p>
                  <div className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <p key={feature} className="border-t border-white/[0.08] pt-3 text-sm text-slate-400">
                        {feature}
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-10 h-13 rounded-full border border-white/15 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-white/45"
                >
                  Upgrade
                </button>
              </article>
            ))}
          </div>

          <div className="mt-10 border border-white/[0.08] bg-[#07090b] p-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
                  Credit Packs
                </p>
                <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white">
                  Add credits when the system needs more production capacity.
                </h3>
              </div>
              <p className="max-w-md text-sm leading-7 text-slate-400">
                Payments are not connected yet. These packs define the commercial structure for the production model.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {creditPacks.map((pack) => (
                <div key={pack.name} className="border border-white/[0.08] bg-black/25 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {pack.name}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">{pack.credits}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{pack.use}</p>
                  <button
                    type="button"
                    disabled
                    className="mt-6 h-11 w-full rounded-full bg-white/10 text-xs font-semibold uppercase tracking-[0.18em] text-white/40"
                  >
                    Add Credits
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28">
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
            href="/builder"
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-[0.22em] text-black hover:bg-slate-200"
          >
            Enter The System
          </a>
        </div>
      </section>
    </main>
  );
}
