import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getUserSubscription: vi.fn(),
  getStripeClient: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => ({
  requireAuth: mocks.requireAuth,
}));

vi.mock("../../lib/emovel-ai/data-access", () => ({
  getUserSubscription: mocks.getUserSubscription,
}));

vi.mock("../../lib/billing/stripe", async () => {
  const actual = await vi.importActual<typeof import("../../lib/billing/stripe")>(
    "../../lib/billing/stripe",
  );

  return {
    ...actual,
    getAppUrl: () => "https://emovel.test",
    getStripeClient: mocks.getStripeClient,
  };
});

import { POST as portalPost } from "../../app/api/stripe/customer-portal/route";

function portalRequest() {
  return new Request("https://emovel.test/api/stripe/customer-portal", {
    method: "POST",
    headers: {
      authorization: "Bearer test-token",
    },
  });
}

describe("Stripe customer portal route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({
      user: { id: "user-1", email: "founder@emovel.test" },
      accessToken: "test-token",
    });
    mocks.getUserSubscription.mockResolvedValue({
      id: "subscription-1",
      user_id: "user-1",
      plan: "pro",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      status: "active",
      current_period_end: "2026-06-01T00:00:00.000Z",
      created_at: "2026-05-07T00:00:00.000Z",
      updated_at: "2026-05-07T00:00:00.000Z",
    });
    mocks.getStripeClient.mockReturnValue({
      billingPortal: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            url: "https://billing.stripe.test/session",
          }),
        },
      },
    });
  });

  it("returns not_found when no Stripe customer exists", async () => {
    mocks.getUserSubscription.mockResolvedValue(null);

    const response = await portalPost(portalRequest());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: "No Stripe customer exists for this account.",
      code: "STRIPE_CUSTOMER_REQUIRED",
      category: "not_found",
    });
    expect(mocks.getStripeClient).not.toHaveBeenCalled();
  });

  it("returns a safe Stripe portal URL for accounts with a customer", async () => {
    const stripe = mocks.getStripeClient();

    const response = await portalPost(portalRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      url: "https://billing.stripe.test/session",
    });
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://emovel.test/billing",
    });
  });
});
