export interface EmovelVisualArchetypeV0 {
  id: string;
  label: string;
  description: string;
  recommendedFor: string[];
}

export const EMOVEL_VISUAL_ARCHETYPES_V0: EmovelVisualArchetypeV0[] = [
  {
    id: "luxury-tech-editorial",
    label: "Luxury Tech Editorial",
    description: "Black-dominant interface with white clarity and restrained cinematic gold accents.",
    recommendedFor: ["premium digital products", "commercial templates", "expert systems"],
  },
  {
    id: "operator-console",
    label: "Operator Console",
    description: "Dense, controlled product surfaces for internal tools and expert workflows.",
    recommendedFor: ["dashboards", "internal tooling", "workflow systems"],
  },
];
