import type { FinalPackage } from "../assistants/types";
import type { SavedMarketingCampaign } from "./types";

export interface MarketingSystemHandoff {
  input: string;
  result: FinalPackage;
  savedAt: string;
}

const campaignsStorageKey = "emovel-assistants-marketing-campaigns";
export const handoffStorageKey = "emovel-assistants-marketing-handoff";

export function readCampaigns(): SavedMarketingCampaign[] {
  try {
    const saved = window.localStorage.getItem(campaignsStorageKey);
    return saved ? (JSON.parse(saved) as SavedMarketingCampaign[]) : [];
  } catch {
    return [];
  }
}

export function writeCampaigns(campaigns: SavedMarketingCampaign[]) {
  window.localStorage.setItem(campaignsStorageKey, JSON.stringify(campaigns));
}

export function readMarketingHandoff(): MarketingSystemHandoff | null {
  try {
    const saved = window.localStorage.getItem(handoffStorageKey);
    return saved ? (JSON.parse(saved) as MarketingSystemHandoff) : null;
  } catch {
    return null;
  }
}

export function writeMarketingHandoff(input: string, result: FinalPackage) {
  const handoff: MarketingSystemHandoff = {
    input,
    result,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(handoffStorageKey, JSON.stringify(handoff));
}
