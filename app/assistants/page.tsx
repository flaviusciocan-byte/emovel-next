import { createPageMetadata } from "../seo";
import AssistantsClient, {
  AssistantsFinalCtaContent,
  AssistantsHeroContent,
} from "./assistants-client";

export const metadata = createPageMetadata({
  title: "EMOVEL Assistants — Orchestrated Execution Modules",
  description:
    "Route strategic requests through EMOVEL execution modules for premium output, commercial assets, and controlled digital product execution.",
  path: "/assistants",
});

export default function Assistants() {
  return (
    <main className="min-h-screen bg-[#030405] text-slate-100">
      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-white/[0.07] px-6 py-24 sm:py-32 lg:px-10">
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-6xl -translate-x-0 flex-col items-start gap-16 lg:-translate-x-8">
          <AssistantsHeroContent />
        </div>
      </section>

      <AssistantsClient />

      <section className="px-6 py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 border border-white/[0.1] bg-white/[0.025] p-8 sm:p-12 lg:flex-row lg:items-center">
          <AssistantsFinalCtaContent />
        </div>
      </section>
    </main>
  );
}
