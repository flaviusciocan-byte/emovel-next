export const V1_FIXED_SECTION_ORDER = [
  "hero",
  "problem",
  "mechanism",
  "offer",
  "proof",
  "final_cta",
] as const;

export type V1SectionKey = (typeof V1_FIXED_SECTION_ORDER)[number];
