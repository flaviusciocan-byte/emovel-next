import { createPageMetadata } from "../../seo";
import BrandProfileClient from "./brand-profile-client";

export const metadata = createPageMetadata({
  title: "EMOVEL Brand Profile",
  description: "Complete your EMOVEL Brand Profile before generating persistent Builder projects.",
  path: "/onboarding/brand-profile",
});

export default function BrandProfilePage() {
  return (
    <main className="min-h-screen bg-[#030405] px-6 py-28 text-white lg:px-10">
      <BrandProfileClient />
    </main>
  );
}
