const leadingFillerPatterns = [
  /^(here is|here's|of course|sure|certainly)[\s,.:;-]+/i,
  /^(iata|desigur|sigur|bineinteles)[\s,.:;-]+/i,
];

export function cleanAssistantOutput(raw: string): string {
  let output = raw.trim();

  for (const pattern of leadingFillerPatterns) {
    output = output.replace(pattern, "");
  }

  return output
    .replace(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g, "$1")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/__([^_\n]+)__/g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
