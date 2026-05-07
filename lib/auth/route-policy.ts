export type RouteAccessPolicy = "public" | "hybrid" | "auth-required";

export const PUBLIC_ROUTES = ["/", "/auth"] as const;

export const HYBRID_ROUTES = ["/builder"] as const;

export const AUTH_REQUIRED_ROUTES = [
  "/onboarding/brand-profile",
  "/settings",
  "/billing",
  "/exports",
  "/dashboard",
] as const;

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function getRouteAccessPolicy(pathname: string): RouteAccessPolicy {
  if (matchesRoute(pathname, HYBRID_ROUTES)) {
    return "hybrid";
  }

  if (matchesRoute(pathname, AUTH_REQUIRED_ROUTES)) {
    return "auth-required";
  }

  return "public";
}
