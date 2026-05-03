import type { RuntimeManifest, RuntimeStyleTokens } from "./types";

const presetStyles: Record<RuntimeManifest["stylePreset"], Omit<RuntimeStyleTokens, "maxWidth" | "sectionPadding" | "radius">> = {
  "premium-dark": {
    background: "#070707",
    surface: "#111111",
    text: "#f7f7f2",
    muted: "#a3a3a3",
    accent: "#d8c89a",
    border: "rgba(255,255,255,0.12)",
  },
  "light-clean": {
    background: "#f8f7f2",
    surface: "#ffffff",
    text: "#111111",
    muted: "#555555",
    accent: "#111111",
    border: "rgba(17,17,17,0.14)",
  },
  "editorial-warm": {
    background: "#120f0b",
    surface: "#1d1811",
    text: "#fff7e8",
    muted: "#b7aa95",
    accent: "#e0b86b",
    border: "rgba(224,184,107,0.18)",
  },
};

const densityStyles: Record<RuntimeManifest["designDensity"], Pick<RuntimeStyleTokens, "maxWidth" | "sectionPadding" | "radius">> = {
  focused: {
    maxWidth: "960px",
    sectionPadding: "64px",
    radius: "10px",
  },
  premium: {
    maxWidth: "1120px",
    sectionPadding: "88px",
    radius: "14px",
  },
  dense: {
    maxWidth: "1240px",
    sectionPadding: "48px",
    radius: "8px",
  },
};

export function resolveRuntimeStyle(manifest: RuntimeManifest): RuntimeStyleTokens {
  return {
    ...presetStyles[manifest.stylePreset],
    ...densityStyles[manifest.designDensity],
  };
}
