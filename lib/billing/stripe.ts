import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export type BillingErrorCategory =
  | "unauthorized"
  | "invalid_request"
  | "config_error"
  | "stripe_error"
  | "webhook_error"
  | "internal_error";

export function billingError(input: {
  status: number;
  category: BillingErrorCategory;
  code: string;
  message: string;
}) {
  return Response.json(
    {
      error: input.message,
      code: input.code,
      category: input.category,
    },
    { status: input.status },
  );
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeProPriceId() {
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    throw new Error("STRIPE_PRO_PRICE_ID is required.");
  }

  return priceId;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required.");
  }

  return webhookSecret;
}

export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return appUrl.replace(/\/+$/g, "");
}

export function isProSubscriptionStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}

export function stripeTimestampToIso(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}
