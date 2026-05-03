import { createPageMetadata } from "../seo";

export const metadata = createPageMetadata({
  title: "EMOVEL Marketing Engine — Controlled Growth Execution",
  description:
    "Build structured marketing campaigns, positioning systems, and scalable launch assets with EMOVEL's marketing engine.",
  path: "/marketing-engine",
});

export default function MarketingEnginePage() {
  return (
    <main className="min-h-screen bg-[#030405] px-6 py-24 text-slate-100 sm:py-32 lg:px-10">
      <section className="mx-auto mt-16 flex w-full max-w-6xl flex-col gap-10 border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.38em] text-slate-500">
          Marketing Engine
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Controlled marketing execution for digital product systems.
        </h1>
        <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
          This workspace centralizes campaign direction, offer framing, and content structures so
          teams can move faster without losing consistency. Use it to turn product signals into
          launch-ready narratives and repeatable market operations.
        </p>
      </section>
    </main>
  );
}
