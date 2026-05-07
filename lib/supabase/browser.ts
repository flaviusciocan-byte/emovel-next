import { getBrowserSupabaseConfig } from "./config";
import { SupabaseRestClient } from "./rest-client";

export function createBrowserSupabaseClient(accessToken?: string) {
  const config = getBrowserSupabaseConfig();

  return new SupabaseRestClient({
    url: config.url,
    apiKey: config.anonKey,
    accessToken,
  });
}
