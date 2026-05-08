import type Stripe from "stripe";

import {
  getServiceStripeEvent,
  getServiceSubscriptionByCustomer,
  markServiceStripeEventProcessed,
  recordServiceStripeEvent,
  updateServiceProfilePlan,
  upsertServiceSubscription,
} from "../../../../lib/emovel-ai/data-access";
import {
  billingError,
  getStripeClient,
  getStripeWebhookSecret,
  isProSubscriptionStatus,
  stripeTimestampToIso,
} from "../../../../lib/billing/stripe";
import type { UserPlan } from "../../../../lib/emovel-ai/types";

function getStringId(value: string | { id?: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id || null;
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const value = (subscription as unknown as { current_period_end?: number }).current_period_end;

  return stripeTimestampToIso(value);
}

function subscriptionPlan(status: string): UserPlan {
  return isProSubscriptionStatus(status) ? "pro" : "free";
}

async function syncSubscription(input: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const plan = subscriptionPlan(input.status);

  await upsertServiceSubscription({
    userId: input.userId,
    plan,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    currentPeriodEnd: input.currentPeriodEnd,
  });
  await updateServiceProfilePlan(input.userId, plan);
}

async function userIdForCustomer(stripeCustomerId: string, fallback?: string | null) {
  if (fallback) {
    return fallback;
  }

  const subscription = await getServiceSubscriptionByCustomer(stripeCustomerId);

  return subscription?.user_id || null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripeCustomerId = getStringId(session.customer);
  const stripeSubscriptionId = getStringId(session.subscription);
  const userId = session.client_reference_id || session.metadata?.userId || null;

  if (!stripeCustomerId || !stripeSubscriptionId || !userId) {
    throw new Error("Checkout session is missing billing identifiers.");
  }

  const subscription = await getStripeClient().subscriptions.retrieve(stripeSubscriptionId);

  await syncSubscription({
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    status: subscription.status,
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
  });
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const stripeCustomerId = getStringId(subscription.customer);

  if (!stripeCustomerId) {
    throw new Error("Subscription is missing customer id.");
  }

  const userId = await userIdForCustomer(stripeCustomerId, subscription.metadata?.userId || null);

  if (!userId) {
    throw new Error("Subscription customer is not linked to a user.");
  }

  await syncSubscription({
    userId,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = getStringId(invoice.customer);

  if (!stripeCustomerId) {
    return;
  }

  const existing = await getServiceSubscriptionByCustomer(stripeCustomerId);

  if (!existing) {
    return;
  }

  await syncSubscription({
    userId: existing.user_id,
    stripeCustomerId,
    stripeSubscriptionId: existing.stripe_subscription_id,
    status: existing.status,
    currentPeriodEnd: existing.current_period_end,
  });
}

async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      return;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChanged(event.data.object as Stripe.Subscription);
      return;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      return;
    default:
      return;
  }
}

function mapWebhookError(error: unknown) {
  const message = error instanceof Error ? error.message : "Stripe webhook failed.";

  if (
    message === "STRIPE_SECRET_KEY is required." ||
    message === "STRIPE_WEBHOOK_SECRET is required."
  ) {
    return billingError({
      status: 500,
      category: "config_error",
      code: "STRIPE_CONFIG_MISSING",
      message,
    });
  }

  console.error("EMOVEL Stripe webhook failed.", {
    category: "webhook_error",
    message,
  });

  return billingError({
    status: 400,
    category: "webhook_error",
    code: "STRIPE_WEBHOOK_FAILED",
    message: "Stripe webhook failed.",
  });
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return billingError({
        status: 400,
        category: "invalid_request",
        code: "STRIPE_SIGNATURE_REQUIRED",
        message: "Stripe signature is required.",
      });
    }

    const rawBody = await request.text();
    const event = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
    const existingEvent = await getServiceStripeEvent(event.id);

    if (existingEvent?.processed) {
      return Response.json({
        received: true,
        duplicate: true,
      });
    }

    if (!existingEvent) {
      await recordServiceStripeEvent({
        id: event.id,
        eventType: event.type,
        payload: event as unknown as Record<string, unknown>,
      });
    }

    await processStripeEvent(event);
    await markServiceStripeEventProcessed(event.id);

    return Response.json({
      received: true,
    });
  } catch (error) {
    return mapWebhookError(error);
  }
}
