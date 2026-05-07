export const POSTHOG_EVENTS = {
  authSignedIn: "emovel_auth_signed_in",
  authSignedUp: "emovel_auth_signed_up",
  authSignedOut: "emovel_auth_signed_out",
  onboardingBrandProfileViewed: "emovel_onboarding_brand_profile_viewed",
  onboardingBrandProfileSaved: "emovel_onboarding_brand_profile_saved",
  builderLocalModeViewed: "emovel_builder_local_mode_viewed",
  builderProjectCreated: "emovel_builder_project_created",
  builderSectionReady: "emovel_builder_section_ready",
  aiGenerateRequested: "emovel_ai_generate_requested",
  aiGenerateBlocked: "emovel_ai_generate_blocked",
  aiGenerateStreamStarted: "emovel_ai_generate_stream_started",
  aiGenerateCompleted: "emovel_ai_generate_completed",
  aiGenerateFailed: "emovel_ai_generate_failed",
  billingGateHit: "emovel_billing_gate_hit",
} as const;

export type PostHogEventName = (typeof POSTHOG_EVENTS)[keyof typeof POSTHOG_EVENTS];
