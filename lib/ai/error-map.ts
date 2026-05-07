export const AI_ROUTE_ERROR_CATEGORIES = [
  "unauthorized",
  "forbidden",
  "rate_limited",
  "billing_gate",
  "boundary_blocked",
  "provider_not_configured",
  "generation_failed",
  "internal_error",
] as const;

export type AiRouteErrorCategory = (typeof AI_ROUTE_ERROR_CATEGORIES)[number];

export interface AiRouteError {
  status: number;
  payload: Record<string, unknown>;
}

const categoryStatus: Record<AiRouteErrorCategory, number> = {
  unauthorized: 401,
  forbidden: 403,
  rate_limited: 429,
  billing_gate: 402,
  boundary_blocked: 403,
  provider_not_configured: 503,
  generation_failed: 400,
  internal_error: 500,
};

export function getAiRouteErrorStatus(category: AiRouteErrorCategory) {
  return categoryStatus[category];
}

export function createAiRouteError(input: {
  category: AiRouteErrorCategory;
  code: string;
  message: string | null | undefined;
  status?: number;
  extra?: Record<string, unknown>;
}): AiRouteError {
  return {
    status: input.status ?? getAiRouteErrorStatus(input.category),
    payload: {
      category: input.category,
      code: input.code,
      error: input.message || input.category,
      ...(input.extra || {}),
    },
  };
}

export function mapUnknownAiRouteError(error: unknown): AiRouteError {
  const message = error instanceof Error ? error.message : "Unexpected AI route failure.";

  if (message === "Authentication required." || message === "Invalid or expired session.") {
    return createAiRouteError({
      category: "unauthorized",
      code: "AUTH_REQUIRED",
      message,
    });
  }

  return createAiRouteError({
    category: "internal_error",
    code: "INTERNAL_ERROR",
    message,
  });
}
