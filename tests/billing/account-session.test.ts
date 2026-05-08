import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getCurrentPlanLimits: vi.fn(),
  getCurrentProfile: vi.fn(),
  getOrCreateUserWorkspace: vi.fn(),
  getUserSubscription: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => ({
  getCurrentUser: mocks.getCurrentUser,
  getCurrentPlanLimits: mocks.getCurrentPlanLimits,
}));

vi.mock("../../lib/emovel-ai/data-access", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  getOrCreateUserWorkspace: mocks.getOrCreateUserWorkspace,
  getUserSubscription: mocks.getUserSubscription,
}));

import { GET as accountSessionGet } from "../../app/api/account/session/route";

describe("account session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({
      user: { id: "user-1", email: "founder@emovel.test" },
      accessToken: "test-token",
    });
    mocks.getCurrentProfile.mockResolvedValue({
      id: "user-1",
      email: "founder@emovel.test",
      full_name: null,
      plan: "pro",
      onboarding_step: "complete",
      created_at: "2026-05-07T00:00:00.000Z",
      updated_at: "2026-05-07T00:00:00.000Z",
    });
    mocks.getOrCreateUserWorkspace.mockResolvedValue({
      id: "workspace-1",
      user_id: "user-1",
      name: "Personal Workspace",
      kind: "personal",
      created_at: "2026-05-07T00:00:00.000Z",
      updated_at: "2026-05-07T00:00:00.000Z",
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
    mocks.getCurrentPlanLimits.mockResolvedValue({
      plan: "pro",
      canExportPdf: true,
      maxProjects: null,
      monthlyAiGenerations: null,
      canCopySections: true,
      memory: { basic: true, advanced: true },
    });
  });

  it("returns updated Pro plan, subscription status, and PDF plan limit", async () => {
    const response = await accountSessionGet(
      new Request("https://emovel.test/api/account/session", {
        headers: { authorization: "Bearer test-token" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.plan).toBe("pro");
    expect(data.subscription.status).toBe("active");
    expect(data.subscription.stripe_customer_id).toBe("cus_123");
    expect(data.planLimits.canExportPdf).toBe(true);
  });
});
