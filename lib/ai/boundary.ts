import type { AiRequestCategory } from "../emovel-ai/types";

export interface BoundaryResult {
  category: AiRequestCategory;
  allowed: boolean;
  confidence: number;
  reason: string;
  requiredClarification?: string;
  normalizedIntent?: string;
}

const blockedRules: Array<{
  category: AiRequestCategory;
  pattern: RegExp;
  reason: string;
  finalOnly?: boolean;
}> = [
  {
    category: "medical_legal_financial_advice",
    pattern: /\b(medical|diagnosis|treatment|legal advice|lawsuit|tax advice|investment advice|stock pick)\b/i,
    reason: "The request asks for regulated medical, legal, financial, or tax advice.",
  },
  {
    category: "news",
    pattern: /\b(news|latest|today|yesterday|breaking|current events)\b/i,
    reason: "The Builder is not a news or current-events assistant.",
  },
  {
    category: "entertainment",
    pattern: /\b(joke|story|poem|song|lyrics|roleplay|game)\b/i,
    reason: "The request is entertainment-oriented rather than commercial production work.",
  },
  {
    category: "trivia_history_science",
    pattern: /\b(history of|who was|when did|science|physics|chemistry|biology|trivia)\b/i,
    reason: "The request is trivia, history, or science explanation rather than Builder work.",
  },
  {
    category: "unrelated_coding_assistant_behavior",
    pattern: /\b(debug|fix my code|typescript error|database query)\b/i,
    reason: "The request asks for unrelated coding assistant behavior.",
  },
  {
    category: "general_knowledge",
    pattern: /\b(explain|what is|how does|who is|define|capital of|distance to|trivia about)\b/i,
    reason: "The request appears to be general knowledge rather than a commercial asset brief.",
    finalOnly: true,
  },
];

const allowedRules: Array<{
  category: AiRequestCategory;
  pattern: RegExp;
  reason: string;
}> = [
  {
    category: "client_deliverable",
    pattern: /\b(client|deliverable|proposal|audit|diagnostic|report|presentation)\b/i,
    reason: "The request is for a commercial client deliverable.",
  },
  {
    category: "monetization",
    pattern: /\b(offer|pricing|monetiz|sell|sales|revenue|paid|checkout|conversion)\b/i,
    reason: "The request has a monetization or offer architecture intent.",
  },
  {
    category: "brand",
    pattern: /\b(brand|positioning|tone|identity|authority|founder|premium)\b/i,
    reason: "The request is centered on brand and positioning.",
  },
  {
    category: "commercial_ui",
    pattern: /\b(landing page|page|website|hero|section|cta|waitlist|lead magnet|template)\b/i,
    reason: "The request is for a commercial page or UI asset.",
  },
  {
    category: "production",
    pattern: /\b(product|system|campaign|launch|asset|builder|workflow|runtime)\b/i,
    reason: "The request is production-oriented and fits the Builder.",
  },
];

export function classifyBoundaryRequest(input: string): BoundaryResult {
  const normalized = input.trim().replace(/\s+/g, " ");

  if (normalized.length < 24) {
    return {
      category: "ambiguous",
      allowed: false,
      confidence: 0.35,
      reason: "The brief is too short to generate a controlled commercial page.",
      requiredClarification:
        "Describe the audience, offer, commercial goal, and the page or asset you want to generate.",
    };
  }

  const hardBlocked = blockedRules.find((rule) => !rule.finalOnly && rule.pattern.test(normalized));

  if (hardBlocked) {
    return {
      category: hardBlocked.category,
      allowed: false,
      confidence: 0.86,
      reason: hardBlocked.reason,
      normalizedIntent: normalized,
    };
  }

  const allowed = allowedRules.find((rule) => rule.pattern.test(normalized));

  if (allowed) {
    return {
      category: allowed.category,
      allowed: true,
      confidence: 0.82,
      reason: allowed.reason,
      normalizedIntent: normalized,
    };
  }

  const softBlocked = blockedRules.find((rule) => rule.finalOnly && rule.pattern.test(normalized));

  if (softBlocked) {
    return {
      category: softBlocked.category,
      allowed: false,
      confidence: 0.74,
      reason: softBlocked.reason,
      normalizedIntent: normalized,
    };
  }

  return {
    category: "ambiguous",
    allowed: false,
    confidence: 0.48,
    reason: "The request does not clearly map to production, brand, monetization, client deliverable, or commercial UI work.",
    requiredClarification:
      "Clarify the commercial asset you want: page type, audience, offer, positioning, and conversion goal.",
    normalizedIntent: normalized,
  };
}

/*
Boundary regression examples:
- Allowed: "explain this offer on a landing page" -> commercial_ui/monetization context.
- Allowed: "what is the best positioning for this product" -> brand context.
- Allowed: "how do I present this product to founders" -> production/brand context.
- Blocked: "what is the capital of France" -> ambiguous/general knowledge.
- Blocked: "diagnose this medical issue" -> medical_legal_financial_advice.
*/
