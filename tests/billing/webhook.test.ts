import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStripeClient: vi.fn(),
  getStripeWebhookSecret: vi.fn(),
  getServiceStripeEvent: vi.fn(),
  recordServiceStripeEvent: vi.fn(),
  markServiceStripeEventProcessed: vi.fn(),
  getServiceSubscriptionByCustomer: vi.fn(),
  upsertServiceSubscription: vi.fn(),
  updateServiceProfilePlan: vi.fn(),
}));

vi.mock("../../lib/billing/stripe", async () => {
  const actual = await vi.importActual<typeof import("../../lib/billing/stripe")>(
    "../../lib/billing/stripe",
  );

  return {
    ...actual,
    getStripeClient: mocks.getStripeClient,
    getStripeWebhookSecret: mocks.getStripeWebhookSecret,
  };
});

vi.mock("../../lib/emovel-ai/data-access", () => ({
  getServiceStripeEvent: mocks.getServiceStripeEvent,
  recordServiceStripeEvent: mocks.recordServiceStripeEvent,
  markServiceStripeEventProcessed: mocks.markServiceStripeEventProcessed,
  getServiceSubscriptionByCustomer: mocks.getServiceSubscriptionByCustomer,
  upsertServiceSubscription: mocks.upsertServiceSubscription,
  updateServiceProfilePlan: mocks.updateServiceProfilePlan,
}));

import { POST as webhookPost } from "../../app/api/stripe/webhook/route";

function webhookRequest(body = "{}") {
  return new Request("https://emovel.test/api/stripe/webhook", {
    method: "POST",
    headers: {
      "stripe-signature": "test-signature",
    },
    body,
  });
}

describe("Stripe webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripeWebhookSecret.mockReturnValue("whsec_test");
    mocks.getServiceStripeEvent.mockResolvedValue(null);
    mocks.recordServiceStripeEvent.mockResolvedValue(null);
    mocks.markServiceStripeEventProcessed.mockResolvedValue(null);
    mocks.getServiceSubscriptionByCustomer.mockResolvedValue({
      user_id: "user-1",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      status: "active",
      current_period_end: "2026-06-01T00:00:00.000Z",
    });
    mocks.upsertServiceSubscription.mockResolvedValue(null);
    mocks.updateServiceProfilePlan.mockResolvedValue(null);
    mocks.getStripeClient.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(),
      },
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          current_period_end: 1780272000,
        }),
      },
    });
  });

  it("rejects invalid signature", async () => {
    const stripe = mocks.getStripeClient();
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const response = await webhookPost(webhookRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Stripe webhook failed.",
      code: "STRIPE_WEBHOOK_FAILED",
      category: "webhook_error",
    });
    expect(mocks.recordServiceStripeEvent).not.toHaveBeenCalled();
  });

  it("returns duplicate without processing when stripe event was already processed", async () => {
    const stripe = mocks.getStripeClient();
    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_123",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          current_period_end: 1780272000,
          metadata: { userId: "user-1" },
        },
      },
    });
    mocks.getServiceStripeEvent.mockResolvedValue({
      id: "evt_123",
      processed: true,
    });

    const response = await webhookPost(webhookRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      received: true,
      duplicate: true,
    });
    expect(mocks.upsertServiceSubscription).not.toHaveBeenCalled();
  });

  it("processes checkout.session.completed and upgrades profile to pro", async () => {
    const stripe = mocks.getStripeClient();
    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_123",
          customer: "cus_123",
          subscription: "sub_123",
          client_reference_id: "user-1",
          metadata: { userId: "user-1" },
        },
      },
    });

    const response = await webhookPost(webhookRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
    expect(mocks.recordServiceStripeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt_checkout",
        eventType: "checkout.session.completed",
      }),
    );
    expect(mocks.upsertServiceSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        plan: "pro",
        status: "active",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
      }),
    );
    expect(mocks.updateServiceProfilePlan).toHaveBeenCalledWith("user-1", "pro");
    expect(mocks.markServiceStripeEventProcessed).toHaveBeenCalledWith("evt_checkout");
  });

  it("processes subscription deleted and downgrades profile to free", async () => {
    const stripe = mocks.getStripeClient();
    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_deleted",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "canceled",
          current_period_end: 1780272000,
          metadata: { userId: "user-1" },
        },
      },
    });

    const response = await webhookPost(webhookRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(mocks.upsertServiceSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        plan: "free",
        status: "canceled",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
      }),
    );
    expect(mocks.updateServiceProfilePlan).toHaveBeenCalledWith("user-1", "free");
  });
});
