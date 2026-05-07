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
