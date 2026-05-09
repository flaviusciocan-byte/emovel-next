export type EmovelKnowledgeDocumentId =
  | "brand_os"
  | "offer_framework"
  | "instagram_system"
  | "product_templates"
  | "copywriting_standard"
  | "visual_direction"
  | "automation_playbook";

export type EmovelKnowledgeModuleId =
  | "brand_system"
  | "offer_builder"
  | "landing_page_builder"
  | "instagram_builder"
  | "product_builder"
  | "automation_engine";

export type EmovelKnowledgeUsage = "primary" | "supporting";

export interface EmovelKnowledgeDocument {
  id: EmovelKnowledgeDocumentId;
  title: string;
  filePath: string;
  purpose: string;
  applicableModules: EmovelKnowledgeModuleId[];
}

export interface EmovelKnowledgeModuleDocument {
  documentId: EmovelKnowledgeDocumentId;
  usage: EmovelKnowledgeUsage;
}

export interface EmovelKnowledgeModuleEntry {
  moduleId: EmovelKnowledgeModuleId;
  documents: EmovelKnowledgeModuleDocument[];
}

export interface EmovelKnowledgeForModule {
  moduleId: EmovelKnowledgeModuleId;
  primary: EmovelKnowledgeDocument[];
  supporting: EmovelKnowledgeDocument[];
}

export const EMOVEL_KNOWLEDGE_DOCUMENTS: readonly EmovelKnowledgeDocument[] = [
  {
    id: "brand_os",
    title: "EMOVEL Brand OS",
    filePath: "docs/emovel-core/01_EMOVEL_Brand_OS.md",
    purpose:
      "Defines EMOVEL's identity, positioning, audience, voice, commercial principles, product principles, and language rules.",
    applicableModules: [
      "brand_system",
      "offer_builder",
      "landing_page_builder",
      "instagram_builder",
      "product_builder",
      "automation_engine",
    ],
  },
  {
    id: "offer_framework",
    title: "EMOVEL Offer Framework",
    filePath: "docs/emovel-core/02_EMOVEL_Offer_Framework.md",
    purpose:
      "Defines how EMOVEL structures premium, monetizable offers with audience clarity, problem framing, mechanisms, value stacks, pricing logic, objections, and CTAs.",
    applicableModules: [
      "offer_builder",
      "landing_page_builder",
      "instagram_builder",
      "product_builder",
      "automation_engine",
    ],
  },
  {
    id: "instagram_system",
    title: "EMOVEL Instagram System",
    filePath: "docs/emovel-core/03_EMOVEL_Instagram_System.md",
    purpose:
      "Defines EMOVEL's premium Instagram strategy for authority, product education, launch content, hooks, carousels, reels, captions, and CTAs.",
    applicableModules: ["instagram_builder"],
  },
  {
    id: "product_templates",
    title: "EMOVEL Product Templates",
    filePath: "docs/emovel-core/04_EMOVEL_Product_Templates.md",
    purpose:
      "Defines product structures for digital products, prompt packs, PDFs, templates, shop assets, landing page products, campaigns, bundles, packaging, and delivery formats.",
    applicableModules: [
      "offer_builder",
      "landing_page_builder",
      "product_builder",
      "automation_engine",
    ],
  },
  {
    id: "copywriting_standard",
    title: "EMOVEL Copywriting Standard",
    filePath: "docs/emovel-core/05_EMOVEL_Copywriting_Standard.md",
    purpose:
      "Defines EMOVEL's premium copy standard for headlines, subheadlines, CTAs, product descriptions, landing pages, Instagram captions, email copy, and launch copy.",
    applicableModules: [
      "brand_system",
      "offer_builder",
      "landing_page_builder",
      "instagram_builder",
      "product_builder",
      "automation_engine",
    ],
  },
  {
    id: "visual_direction",
    title: "EMOVEL Visual Direction",
    filePath: "docs/emovel-core/06_EMOVEL_Visual_Direction.md",
    purpose:
      "Defines EMOVEL's luxury-tech visual system across color, typography, spacing, surfaces, CTAs, icons, motion, Builder UI, dashboards, PDFs, and exports.",
    applicableModules: [
      "brand_system",
      "offer_builder",
      "landing_page_builder",
      "instagram_builder",
      "product_builder",
      "automation_engine",
    ],
  },
  {
    id: "automation_playbook",
    title: "EMOVEL Automation Playbook",
    filePath: "docs/emovel-core/07_EMOVEL_Automation_Playbook.md",
    purpose:
      "Defines EMOVEL's workflow, routing, memory, export, billing access, delivery, quality control, and failure handling automation principles.",
    applicableModules: [
      "brand_system",
      "landing_page_builder",
      "product_builder",
      "automation_engine",
    ],
  },
] as const;

export const EMOVEL_KNOWLEDGE_MODULES: readonly EmovelKnowledgeModuleEntry[] = [
  {
    moduleId: "brand_system",
    documents: [
      { documentId: "brand_os", usage: "primary" },
      { documentId: "copywriting_standard", usage: "supporting" },
      { documentId: "visual_direction", usage: "supporting" },
      { documentId: "automation_playbook", usage: "supporting" },
    ],
  },
  {
    moduleId: "offer_builder",
    documents: [
      { documentId: "offer_framework", usage: "primary" },
      { documentId: "brand_os", usage: "supporting" },
      { documentId: "copywriting_standard", usage: "supporting" },
      { documentId: "product_templates", usage: "supporting" },
      { documentId: "visual_direction", usage: "supporting" },
    ],
  },
  {
    moduleId: "landing_page_builder",
    documents: [
      { documentId: "offer_framework", usage: "primary" },
      { documentId: "copywriting_standard", usage: "primary" },
      { documentId: "visual_direction", usage: "primary" },
      { documentId: "brand_os", usage: "supporting" },
      { documentId: "product_templates", usage: "supporting" },
      { documentId: "automation_playbook", usage: "supporting" },
    ],
  },
  {
    moduleId: "instagram_builder",
    documents: [
      { documentId: "instagram_system", usage: "primary" },
      { documentId: "copywriting_standard", usage: "supporting" },
      { documentId: "brand_os", usage: "supporting" },
      { documentId: "offer_framework", usage: "supporting" },
      { documentId: "visual_direction", usage: "supporting" },
    ],
  },
  {
    moduleId: "product_builder",
    documents: [
      { documentId: "product_templates", usage: "primary" },
      { documentId: "offer_framework", usage: "supporting" },
      { documentId: "copywriting_standard", usage: "supporting" },
      { documentId: "brand_os", usage: "supporting" },
      { documentId: "visual_direction", usage: "supporting" },
      { documentId: "automation_playbook", usage: "supporting" },
    ],
  },
  {
    moduleId: "automation_engine",
    documents: [
      { documentId: "automation_playbook", usage: "primary" },
      { documentId: "brand_os", usage: "supporting" },
      { documentId: "offer_framework", usage: "supporting" },
      { documentId: "product_templates", usage: "supporting" },
      { documentId: "copywriting_standard", usage: "supporting" },
      { documentId: "visual_direction", usage: "supporting" },
    ],
  },
] as const;

const documentsById = new Map(
  EMOVEL_KNOWLEDGE_DOCUMENTS.map((document) => [document.id, document]),
);

export function getKnowledgeForModule(
  moduleId: EmovelKnowledgeModuleId,
): EmovelKnowledgeForModule {
  const moduleEntry = EMOVEL_KNOWLEDGE_MODULES.find((entry) => entry.moduleId === moduleId);

  if (!moduleEntry) {
    return {
      moduleId,
      primary: [],
      supporting: [],
    };
  }

  const primary: EmovelKnowledgeDocument[] = [];
  const supporting: EmovelKnowledgeDocument[] = [];

  moduleEntry.documents.forEach(({ documentId, usage }) => {
    const document = documentsById.get(documentId);

    if (!document) {
      return;
    }

    if (usage === "primary") {
      primary.push(document);
      return;
    }

    supporting.push(document);
  });

  return {
    moduleId,
    primary: [...primary],
    supporting: [...supporting],
  };
}
