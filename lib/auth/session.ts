import { getServerSupabaseConfig } from "../supabase/config";
import {
  getCurrentProfile as readCurrentProfile,
  getOrCreateUserWorkspace,
} from "../emovel-ai/data-access";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
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
  const { user, accessToken } = await requireUser(request);

  return readCurrentProfile({
    userId: user.id,
    accessToken,
  });
}

export async function getCurrentWorkspace(request: Request) {
  const { user, accessToken } = await requireUser(request);

  return getOrCreateUserWorkspace({
    userId: user.id,
    accessToken,
  });
}
