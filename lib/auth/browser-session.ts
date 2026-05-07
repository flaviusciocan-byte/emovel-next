export function getStoredSupabaseAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const explicitToken = window.localStorage.getItem("emovel-supabase-access-token");

  if (explicitToken) {
    return explicitToken;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) {
      continue;
    }

    const value = window.localStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      const parsed = JSON.parse(value) as {
        access_token?: string;
        currentSession?: {
          access_token?: string;
        };
      };

      return parsed.access_token || parsed.currentSession?.access_token || null;
    } catch {
      return null;
    }
  }

  return null;
}

export function getStoredSupabaseRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("emovel-supabase-refresh-token");
}

export function storeSupabaseSession(session: {
  access_token?: string;
  refresh_token?: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  if (session.access_token) {
    window.localStorage.setItem("emovel-supabase-access-token", session.access_token);
  }

  if (session.refresh_token) {
    window.localStorage.setItem("emovel-supabase-refresh-token", session.refresh_token);
  }
}

export function clearStoredSupabaseSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("emovel-supabase-access-token");
  window.localStorage.removeItem("emovel-supabase-refresh-token");
}
