import type { EmovelThemeV0 } from "../schema/app-schema.v0";

export interface EmovelThemePackOptionV0 extends EmovelThemeV0 {
  label: string;
}

export const EMOVEL_THEME_PACKS_V0: EmovelThemePackOptionV0[] = [
  {
    packId: "emovel-black-gold",
    label: "EMOVEL Black Gold",
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
  {
    packId: "emovel-obsidian-blue",
    label: "EMOVEL Obsidian Blue",
    archetypeId: "operator-console",
    mode: "dark",
    tokens: {
      background: "#05070A",
      surface: "#0E141B",
      text: "#F4F7FA",
      mutedText: "#9EAAB8",
      accent: "#7EA6C8",
      border: "#1F2B36",
      radius: "8px",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    notes: "Dark operational theme for controlled dashboards and App Factory planning surfaces.",
  },
  {
    packId: "emovel-graphite-ivory",
    label: "EMOVEL Graphite Ivory",
    archetypeId: "luxury-tech-editorial",
    mode: "light",
    tokens: {
      background: "#F6F2EA",
      surface: "#FFFDF8",
      text: "#161412",
      mutedText: "#6F6860",
      accent: "#9A7832",
      border: "#DDD4C6",
      radius: "8px",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    notes: "Light editorial theme for premium documentation, template previews, and commercial briefs.",
  },
  {
    packId: "emovel-carbon-sand",
    label: "EMOVEL Carbon Sand",
    archetypeId: "luxury-tech-editorial",
    mode: "dark",
    tokens: {
      background: "#080706",
      surface: "#17130F",
      text: "#F5EFE5",
      mutedText: "#B3A899",
      accent: "#D0A85D",
      border: "#2E281F",
      radius: "8px",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    notes: "Warm premium dark theme for template shops, founder pages, and productized offers.",
  },
  {
    packId: "emovel-midnight-purple",
    label: "EMOVEL Midnight Purple",
    archetypeId: "operator-console",
    mode: "dark",
    tokens: {
      background: "#07060A",
      surface: "#121019",
      text: "#F6F2FF",
      mutedText: "#A8A0B8",
      accent: "#BFA3FF",
      border: "#2A2435",
      radius: "8px",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    notes: "Restrained midnight theme for experimental App Factory concepts without importing external branding.",
  },
];

export function getDefaultThemePackV0() {
  return EMOVEL_THEME_PACKS_V0[0];
}
