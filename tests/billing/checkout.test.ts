import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getUserSubscription: vi.fn(),
  upsertServiceSubscription: vi.fn(),
  getStripeClient: vi.fn(),
  getStripeProPriceId: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => ({
  requireAuth: mocks.requireAuth,
}));

vi.mock("../../lib/emovel-ai/data-access", () => ({
  getUserSubscription: mocks.getUserSubscription,
  upsertServiceSubscription: mocks.upsertServiceSubscription,
}));

vi.mock("../../lib/billing/stripe", async () => {
  const actual = await vi.importActual<typeof import("../../lib/billing/stripe")>(
    "../../lib/billing/stripe",
  );

  return {
    ...actual,
    getAppUrl: () => "https://emovel.test",
    getStripeClient: mocks.getStripeClient,
    getStripeProPriceId: mocks.getStripeProPriceId,
  };
});

import { POST as checkoutPost } from "../../app/api/stripe/checkout/route";

function checkoutRequest() {
  return new Request("https://emovel.test/api/stripe/checkout", {
    method: "POST",
    headers: {
      authorization: "Bearer test-token",
    },
  });
}

describe("Stripe checkout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({
      user: { id: "user-1", email: "founder@emovel.test" },
      accessToken: "test-token",
    });
    mocks.getUserSubscription.mockResolvedValue(null);
    mocks.upsertServiceSubscription.mockResolvedValue(null);
    mocks.getStripeProPriceId.mockReturnValue("price_pro_123");
    mocks.getStripeClient.mockReturnValue({
      customers: {
        create: vi.fn().mockResolvedValue({ id: "cus_123" }),
      },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_123",
            url: "https://checkout.stripe.test/session",
          }),
        },
      },
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValue(new Error("Authentication required."));

    const response = await checkoutPost(checkoutRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Authentication required.",
      code: "AUTH_REQUIRED",
      category: "unauthorized",
    });
  });

  it("creates a Pro checkout session for a free user", async () => {
    const stripe = mocks.getStripeClient();

    const response = await checkoutPost(checkoutRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      sessionId: "cs_123",
      url: "https://checkout.stripe.test/session",
    });
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: "founder@emovel.test",
      metadata: { userId: "user-1" },
    });
    expect(mocks.upsertServiceSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        plan: "free",
        stripeCustomerId: "cus_123",
      }),
    );
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_123",
        client_reference_id: "user-1",
        line_items: [{ price: "price_pro_123", quantity: 1 }],
        success_url: "https://emovel.test/builder?billing=success",
      }),
    );
  });

  it("returns config_error when STRIPE_PRO_PRICE_ID is missing", async () => {
    mocks.getStripeProPriceId.mockImplementation(() => {
      throw new Error("STRIPE_PRO_PRICE_ID is required.");
    });

    const response = await checkoutPost(checkoutRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "STRIPE_PRO_PRICE_ID is required.",
      code: "STRIPE_CONFIG_MISSING",
      category: "config_error",
    });
  });
});
