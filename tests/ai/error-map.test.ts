import { describe, expect, it } from "vitest";

import {
  AI_ROUTE_ERROR_CATEGORIES,
  createAiRouteError,
  getAiRouteErrorStatus,
  mapUnknownAiRouteError,
} from "../../lib/ai/error-map";

describe("AI route error map", () => {
  it("supports the expected route error categories", () => {
    expect(AI_ROUTE_ERROR_CATEGORIES).toEqual([
      "unauthorized",
      "forbidden",
      "rate_limited",
      "billing_gate",
      "boundary_blocked",
      "provider_not_configured",
      "generation_failed",
      "internal_error",
    ]);
  });

  it.each([
    ["unauthorized", 401],
    ["forbidden", 403],
    ["rate_limited", 429],
    ["billing_gate", 402],
    ["boundary_blocked", 403],
    ["provider_not_configured", 503],
    ["generation_failed", 400],
    ["internal_error", 500],
  ] as const)("maps %s to HTTP %s", (category, status) => {
    expect(getAiRouteErrorStatus(category)).toBe(status);
  });

  it("creates the same response payload shape used by the AI endpoint", () => {
    const error = createAiRouteError({
      category: "rate_limited",
      code: "RATE_LIMITED",
      message: "Rate limit reached. Try again shortly.",
      extra: {
        resetAt: "2026-05-07T10:00:00.000Z",
      },
    });

    expect(error).toEqual({
      status: 429,
      payload: {
        category: "rate_limited",
        code: "RATE_LIMITED",
        error: "Rate limit reached. Try again shortly.",
        resetAt: "2026-05-07T10:00:00.000Z",
      },
    });
  });

  it.each(["Authentication required.", "Invalid or expired session."])(
    "maps auth exception %s to unauthorized",
    (message) => {
      expect(mapUnknownAiRouteError(new Error(message))).toEqual({
        status: 401,
        payload: {
          category: "unauthorized",
          code: "AUTH_REQUIRED",
          error: message,
        },
      });
    },
  );

  it("maps unexpected exceptions to internal_error", () => {
    expect(mapUnknownAiRouteError(new Error("Database unavailable."))).toEqual({
      status: 500,
      payload: {
        category: "internal_error",
        code: "INTERNAL_ERROR",
        error: "Database unavailable.",
      },
    });
  });

  it("maps non-error throws to internal_error without leaking object internals", () => {
    expect(mapUnknownAiRouteError({ reason: "unknown" })).toEqual({
      status: 500,
      payload: {
        category: "internal_error",
        code: "INTERNAL_ERROR",
        error: "Unexpected AI route failure.",
      },
    });
  });
});
