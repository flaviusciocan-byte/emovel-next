export type MarketingStatus = "draft" | "approved" | "scheduled" | "published" | "failed";

export type MarketingImageStatus = "draft" | "ready" | "generated" | "failed";

export type MarketingBackgroundMode =
  | "cinematic-dark"
  | "luxury-gradient"
  | "product-studio"
  | "clean-white"
  | "transparent-style";

export type MarketingPlatformFormat =
  | "Instagram/Facebook Post"
  | "Story/Reel Cover"
  | "Square Product Ad";

export interface MarketingResult {
  campaignTitle: string;
  platform: string;
  visualVariantA: string;
  visualVariantB: string;
  caption: string;
  hashtags: string[];
  cta: string;
  format: string;
  status: MarketingStatus;
}

export interface MarketingImageModel {
  visualPrompt: string;
  platformFormat: MarketingPlatformFormat;
  backgroundMode: MarketingBackgroundMode;
  stylePreset: string;
  size: string;
  status: MarketingImageStatus;
  imageUrl?: string;
}

export interface SavedMarketingCampaign extends MarketingResult {
  id: string;
  savedAt: string;
  reminderNote?: string;
}
