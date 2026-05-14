import type { EmovelQaChecklistItemV0 } from "../schema/app-schema.v0";

export const EMOVEL_OUTPUT_CHECKLIST_V0: EmovelQaChecklistItemV0[] = [
  {
    id: "schema-has-required-sections",
    label: "Generated schema includes project, audience, screens, components, theme, actions, data, exports, and QA.",
    status: "pending",
    severity: "high",
    owner: "compiler",
  },
  {
    id: "commercial-flow-preserved",
    label: "Commercial intent and monetization path are explicit before UI generation.",
    status: "pending",
    severity: "high",
    owner: "content",
  },
  {
    id: "theme-pack-owned",
    label: "Theme pack uses EMOVEL-owned tokens and avoids external UI system copying.",
    status: "pending",
    severity: "medium",
    owner: "design",
  },
  {
    id: "export-targets-declared",
    label: "Export targets are declared without deployment or runtime side effects.",
    status: "pending",
    severity: "medium",
    owner: "engineering",
  },
];
