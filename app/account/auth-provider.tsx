"use client";

import { AuthSessionProvider } from "../../lib/auth/use-auth-session";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
