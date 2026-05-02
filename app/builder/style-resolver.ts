import type { BuilderSpec, ResolvedStyle } from "./types";

const presetStyles: Record<BuilderSpec["stylePreset"], Omit<ResolvedStyle, "maxWidth" | "sectionPadding" | "radius">> = {
  "premium-dark": {
    background: "#070707",
    surface: "#111111",
    text: "#f7f7f2",
    muted: "#a3a3a3",
    accent: "#d8c89a",
    border: "rgba(255,255,255,0.12)",
    font: "Inter / system sans",
  },
  "light-clean": {
    background: "#f8f7f2",
    surface: "#ffffff",
    text: "#111111",
    muted: "#555555",
    accent: "#111111",
    border: "rgba(17,17,17,0.14)",
    font: "Inter / system sans",
  },
  "editorial-warm": {
    background: "#120f0b",
    surface: "#1d1811",
    text: "#fff7e8",
    muted: "#b7aa95",
    accent: "#e0b86b",
    border: "rgba(224,184,107,0.18)",
    font: "Inter / system sans",
  },
};

const densityStyles: Record<BuilderSpec["designDensity"], Pick<ResolvedStyle, "maxWidth" | "sectionPadding" | "radius">> = {
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

export function resolveStyle(spec: BuilderSpec): ResolvedStyle {
  return {
    ...presetStyles[spec.stylePreset],
    ...densityStyles[spec.designDensity],
  };
}
