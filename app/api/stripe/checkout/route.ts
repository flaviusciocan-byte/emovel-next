import { requireAuth } from "../../../../lib/auth/session";
import {
  getUserSubscription,
  upsertServiceSubscription,
} from "../../../../lib/emovel-ai/data-access";
import {
  billingError,
  getAppUrl,
  getStripeClient,
  getStripeProPriceId,
} from "../../../../lib/billing/stripe";

function mapCheckoutError(error: unknown) {
  const message = error instanceof Error ? error.message : "Checkout failed.";

  if (message === "Authentication required." || message === "Invalid or expired session.") {
    return billingError({
      status: 401,
      category: "unauthorized",
      code: "AUTH_REQUIRED",
      message,
    });
  }

  if (message === "STRIPE_SECRET_KEY is required." || message === "STRIPE_PRO_PRICE_ID is required.") {
    return billingError({
      status: 500,
      category: "config_error",
      code: "STRIPE_CONFIG_MISSING",
      message,
    });
  }

  console.error("EMOVEL Stripe checkout failed.", {
    category: "stripe_error",
    message,
  });

  return billingError({
    status: 500,
    category: "stripe_error",
    code: "STRIPE_CHECKOUT_FAILED",
    message: "Stripe checkout failed.",
  });
}

export async function POST(request: Request) {
  try {
    const { user, accessToken } = await requireAuth(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const stripe = getStripeClient();
    const priceId = getStripeProPriceId();
    const subscription = await getUserSubscription(context);
    const customerId =
      subscription?.stripe_customer_id ||
      (
        await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        })
      ).id;

    if (!subscription?.stripe_customer_id) {
      await upsertServiceSubscription({
        userId: user.id,
        plan: "free",
        status: subscription?.status || "inactive",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription?.stripe_subscription_id || null,
        currentPeriodEnd: subscription?.current_period_end || null,
      });
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      success_url: `${appUrl}/builder?billing=success`,
      cancel_url: `${appUrl}/billing?billing=cancelled`,
      allow_promotion_codes: false,
      metadata: {
        userId: user.id,
        plan: "pro",
      },
    });

    return Response.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return mapCheckoutError(error);
  }
}
