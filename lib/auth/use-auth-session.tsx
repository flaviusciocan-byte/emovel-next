"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signOutBrowserSession } from "./browser-auth";
import { getStoredSupabaseAccessToken } from "./browser-session";
import type { PlanLimits, Profile, SubscriptionRecord, UserPlan, Workspace } from "../emovel-ai/types";

interface CurrentUser {
  id: string;
  email?: string;
  role?: string;
}

interface AccountSessionResponse {
  authenticated: boolean;
  user: CurrentUser | null;
  profile: Profile | null;
  workspace: Workspace | null;
  subscription: SubscriptionRecord | null;
  plan: UserPlan;
  onboardingStep: Profile["onboarding_step"] | null;
  planLimits: PlanLimits | null;
  error?: string;
}

interface AuthSessionContextValue extends AccountSessionResponse {
  loading: boolean;
  token: string | null;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const localSession: AccountSessionResponse = {
  authenticated: false,
  user: null,
  profile: null,
  workspace: null,
  subscription: null,
  plan: "free",
  onboardingStep: null,
  planLimits: null,
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getStoredSupabaseAccessToken());
  const [loading, setLoading] = useState(Boolean(token));
  const [session, setSession] = useState<AccountSessionResponse>(localSession);

  const refresh = useCallback(async () => {
    const storedToken = getStoredSupabaseAccessToken();
    setToken(storedToken);

    if (!storedToken) {
      setSession(localSession);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/account/session", {
        headers: authHeaders(storedToken),
      });

      if (!response.ok) {
        throw new Error("Session is unavailable.");
      }

      const data = (await response.json()) as AccountSessionResponse;
      setSession(data);
    } catch {
      signOutBrowserSession();
      setToken(null);
      setSession(localSession);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  const signOut = useCallback(() => {
    signOutBrowserSession();
    setToken(null);
    setSession(localSession);
    setLoading(false);
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      ...session,
      loading,
      token,
      refresh,
      signOut,
    }),
    [loading, refresh, session, signOut, token],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  }

  return context;
}

export function useCurrentUser() {
  return useAuthSession().user;
}

export function useCurrentWorkspace() {
  return useAuthSession().workspace;
}

export function useCurrentPlan() {
  return useAuthSession().plan;
}
