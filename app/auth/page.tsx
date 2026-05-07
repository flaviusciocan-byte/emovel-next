import { createPageMetadata } from "../seo";
import AuthClient from "./auth-client";

export const metadata = createPageMetadata({
  title: "EMOVEL Auth - Sign In",
  description: "Sign in to save EMOVEL Builder projects and continue your work later.",
  path: "/auth",
});

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#030405] px-6 py-28 text-white lg:px-10">
      <AuthClient />
    </main>
  );
}
