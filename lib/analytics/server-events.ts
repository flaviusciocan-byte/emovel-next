import type { PostHogEventName } from "./posthog-events";

export async function captureServerEvent(
  distinctId: string,
  event: PostHogEventName,
  properties: Record<string, unknown> = {},
) {
  const key = process.env.POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST || "https://app.posthog.com";

  if (!key) {
    return;
  }

  try {
    await fetch(`${host.replace(/\/$/, "")}/capture/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties,
      }),
    });
  } catch {
    // Analytics must never block generation.
  }
}
