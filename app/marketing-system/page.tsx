import { createPageMetadata } from "../seo";
import MarketingSystemClient from "./marketing-system-client";

export const metadata = createPageMetadata({
  title: "EMOVEL Marketing System — Commercial Output Production",
  description:
    "Generate EMOVEL Social Packs from assistant context, prepare premium visual prompts, and manage local campaign drafts.",
  path: "/marketing-system",
});

export default function MarketingSystem() {
  return (
    <main className="min-h-screen bg-[#030405] text-slate-100">
      <MarketingSystemClient />
    </main>
  );
}
