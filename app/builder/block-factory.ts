import type { BlockType, BuilderBlock, PageConfig } from "./types";

let blockCounter = 0;

export function createBlockId(type: BlockType) {
  blockCounter += 1;
  return `${type}-${Date.now()}-${blockCounter}`;
}

export function createDefaultBlock(type: BlockType): BuilderBlock {
  const id = createBlockId(type);

  if (type === "hero") {
    return {
      id,
      type,
      data: {
        headline: "Build Systems That Convert",
        subheadline:
          "A premium digital product system with clear positioning, controlled logic, and conversion-ready execution.",
        cta: "Enter The System",
      },
    };
  }

  if (type === "features") {
    return {
      id,
      type,
      data: {
        headline: "Execution Layers",
        items: [
          "Product architecture",
          "Prompt logic",
          "Commercial assets",
        ],
      },
    };
  }

  if (type === "proof") {
    return {
      id,
      type,
      data: {
        stats: ["Structured logic", "Premium interface", "Clear offer path"],
      },
    };
  }

  if (type === "pricing") {
    return {
      id,
      type,
      data: {
        headline: "Offer Structure",
        tiers: ["Core System", "Premium Build", "Execution Partner"],
      },
    };
  }

  if (type === "faq") {
    return {
      id,
      type,
      data: {
        headline: "Common Questions",
        items: [
          "What is the product outcome?",
          "Who is the system built for?",
          "What happens after launch?",
        ],
      },
    };
  }

  if (type === "cta") {
    return {
      id,
      type,
      data: {
        headline: "Turn the structure into a launch-ready asset.",
        buttonText: "Prepare Build",
      },
    };
  }

  if (type === "footer") {
    return {
      id,
      type,
      data: {
        brand: "EMOVEL",
        tagline: "Controlled systems for digital products.",
      },
    };
  }

  return {
    id,
    type,
    data: {
      content:
        "Add editorial copy, delivery notes, or system documentation for this section.",
    },
  };
}

export function createInitialPageConfig(): PageConfig {
  return {
    title: "EMOVEL Product System",
    description:
      "A controlled digital product page built with EMOVEL architecture.",
    theme: "dark",
    accentColor: "#D4C08A",
    font: "Inter",
    blocks: [
      createDefaultBlock("hero"),
      createDefaultBlock("features"),
      createDefaultBlock("proof"),
      createDefaultBlock("cta"),
      createDefaultBlock("footer"),
    ],
  };
}
