import { describe, expect, it } from "vitest";

import { classifyBoundaryRequest } from "../../lib/ai/boundary";

describe("classifyBoundaryRequest", () => {
  it.each([
    "explain this offer on a landing page",
    "what is the best positioning for this product",
    "how do I present this product to founders",
  ])("allows commercial prompt with general phrasing: %s", (prompt) => {
    const result = classifyBoundaryRequest(prompt);

    expect(result.allowed).toBe(true);
    expect([
      "production",
      "brand",
      "monetization",
      "client_deliverable",
      "commercial_ui",
    ]).toContain(result.category);
  });

  it.each([
    ["what is the capital of France", "general_knowledge"],
    ["write a joke for a product launch party", "entertainment"],
    ["give me medical diagnosis and treatment advice for this symptom", "medical_legal_financial_advice"],
    ["fix my TypeScript error in this React component", "unrelated_coding_assistant_behavior"],
    ["history of ancient Rome trivia", "trivia_history_science"],
  ])("blocks non-production prompt: %s", (prompt, category) => {
    const result = classifyBoundaryRequest(prompt);

    expect(result.allowed).toBe(false);
    expect(result.category).toBe(category);
  });
});
