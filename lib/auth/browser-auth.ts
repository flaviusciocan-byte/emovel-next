import { getBrowserSupabaseConfig } from "../supabase/config";
import {
  clearStoredSupabaseSession,
  getStoredSupabaseAccessToken,
  storeSupabaseSession,
} from "./browser-session";

interface SupabaseAuthSession {
  access_token?: string;
  refresh_token?: string;
}

interface SupabaseAuthError {
  error_description?: string;
  msg?: string;
}

export interface BrowserAuthUser {
  id: string;
  email?: string;
}

function isAuthError(value: unknown): value is SupabaseAuthError {
  return Boolean(value) && typeof value === "object";
}

async function authRequest<T>(path: string, init: RequestInit) {
  const config = getBrowserSupabaseConfig();
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      "content-type": "application/json",
      ...init.headers,
    },
  });

  const data = (await response.json().catch(() => null)) as T | SupabaseAuthError | null;

  if (!response.ok) {
    const message = isAuthError(data)
      ? data.error_description || data.msg
      : "Authentication request failed.";
    throw new Error(message || "Authentication request failed.");
  }

  return data as T;
}

export async function signUpWithEmail(email: string, password: string) {
  const data = await authRequest<SupabaseAuthSession>("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  storeSupabaseSession(data);
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const data = await authRequest<SupabaseAuthSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  storeSupabaseSession(data);
  return data;
}

export async function getCurrentBrowserUser() {
  const token = getStoredSupabaseAccessToken();

  if (!token) {
    return null;
  }

  const data = await authRequest<BrowserAuthUser>("/auth/v1/user", {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return data?.id ? data : null;
}

export function signOutBrowserSession() {
  clearStoredSupabaseSession();
}
