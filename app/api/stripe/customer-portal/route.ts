import { requireAuth } from "../../../../lib/auth/session";
import { getUserSubscription } from "../../../../lib/emovel-ai/data-access";
import {
  billingError,
  getAppUrl,
  getStripeClient,
} from "../../../../lib/billing/stripe";

function mapPortalError(error: unknown) {
  const message = error instanceof Error ? error.message : "Customer portal failed.";

  if (message === "Authentication required." || message === "Invalid or expired session.") {
    return billingError({
      status: 401,
      category: "unauthorized",
      code: "AUTH_REQUIRED",
      message,
    });
  }

  if (message === "STRIPE_SECRET_KEY is required.") {
    return billingError({
      status: 500,
      category: "config_error",
      code: "STRIPE_CONFIG_MISSING",
      message,
    });
  }

  console.error("EMOVEL Stripe customer portal failed.", {
    category: "stripe_error",
    message,
  });

  return billingError({
    status: 500,
    category: "stripe_error",
    code: "STRIPE_PORTAL_FAILED",
    message: "Stripe customer portal failed.",
  });
}

export async function POST(request: Request) {
  try {
    const { user, accessToken } = await requireAuth(request);
    const subscription = await getUserSubscription({
      userId: user.id,
      accessToken,
    });

    if (!subscription?.stripe_customer_id) {
      return billingError({
        status: 400,
        category: "invalid_request",
        code: "STRIPE_CUSTOMER_REQUIRED",
        message: "No Stripe customer exists for this account.",
      });
    }

    const session = await getStripeClient().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getAppUrl()}/billing`,
    });

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    return mapPortalError(error);
  }
}
