import type { EmovelThemeV0 } from "../schema/app-schema.v0";

export const EMOVEL_THEME_PACKS_V0: EmovelThemeV0[] = [
  {
    packId: "emovel-black-gold",
    archetypeId: "luxury-tech-editorial",
    mode: "dark",
    tokens: {
      background: "#050505",
      surface: "#111111",
      text: "#F7F4EE",
      mutedText: "#A8A29A",
      accent: "#C8A24A",
      border: "#2A2722",
      radius: "8px",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    notes: "Default EMOVEL-owned theme foundation. No external design systems included.",
  },
];

export function getDefaultThemePackV0() {
  return EMOVEL_THEME_PACKS_V0[0];
}
