import { getServerSupabaseConfig } from "../supabase/config";
import {
  getCurrentProfile as readCurrentProfile,
  getOnboardingStep as readOnboardingStep,
  getOrCreateUserWorkspace,
} from "../emovel-ai/data-access";
import { getPlanLimits } from "../billing/plan-limits";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  accessToken: string;
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

export async function getUserFromAccessToken(accessToken: string) {
  const config = getServerSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as {
    id?: string;
    email?: string;
    role?: string;
  };

  return user.id
    ? ({
        id: user.id,
        email: user.email,
        role: user.role,
      } satisfies AuthenticatedUser)
    : null;
}

export async function requireUser(request: Request) {
  return requireAuth(request);
}

export async function getCurrentUser(request: Request): Promise<AuthContext | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const user = await getUserFromAccessToken(token);

  if (!user) {
    return null;
  }

  return {
    user,
    accessToken: token,
  };
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Authentication required.");
  }

  const user = await getUserFromAccessToken(token);

  if (!user) {
    throw new Error("Invalid or expired session.");
  }

  return {
    user,
    accessToken: token,
  };
}

export async function getCurrentProfile(request: Request) {
  const { user, accessToken } = await requireAuth(request);

  return readCurrentProfile({
    userId: user.id,
    accessToken,
  });
}

export async function getCurrentWorkspace(request: Request) {
  return requireWorkspace(request);
}

export async function requireWorkspace(request: Request) {
  const { user, accessToken } = await requireAuth(request);

  return getOrCreateUserWorkspace({
    userId: user.id,
    accessToken,
  });
}

export async function getCurrentPlan(request: Request) {
  const profile = await getCurrentProfile(request);

  return profile?.plan || "free";
}

export async function getCurrentPlanLimits(request: Request) {
  return getPlanLimits(await getCurrentPlan(request));
}

export async function getOnboardingStep(request: Request) {
  const { user, accessToken } = await requireAuth(request);

  return readOnboardingStep({
    userId: user.id,
    accessToken,
  });
}
