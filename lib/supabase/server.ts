import { getServerSupabaseConfig } from "./config";
import { SupabaseRestClient } from "./rest-client";

export function createServerSupabaseClient(accessToken?: string) {
  const config = getServerSupabaseConfig();

  return new SupabaseRestClient({
    url: config.url,
    apiKey: config.anonKey,
    accessToken,
  });
}

export function createServiceSupabaseClient() {
  const config = getServerSupabaseConfig();

  if (!config.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for service Supabase access.");
  }

  return new SupabaseRestClient({
    url: config.url,
    apiKey: config.serviceRoleKey,
  });
}
