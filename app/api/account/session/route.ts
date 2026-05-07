import {
  getCurrentPlanLimits,
  getCurrentUser,
} from "../../../../lib/auth/session";
import {
  getCurrentProfile,
  getOrCreateUserWorkspace,
} from "../../../../lib/emovel-ai/data-access";

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);

    if (!auth) {
      return Response.json({
        authenticated: false,
        user: null,
        profile: null,
        workspace: null,
        plan: "free",
        onboardingStep: null,
        planLimits: null,
      });
    }

    const context = {
      userId: auth.user.id,
      accessToken: auth.accessToken,
    };
    const [profile, workspace, planLimits] = await Promise.all([
      getCurrentProfile(context),
      getOrCreateUserWorkspace(context),
      getCurrentPlanLimits(request),
    ]);

    return Response.json({
      authenticated: true,
      user: auth.user,
      profile,
      workspace,
      plan: profile?.plan || "free",
      onboardingStep: profile?.onboarding_step || null,
      planLimits,
    });
  } catch (error) {
    return Response.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Unable to load account session.",
      },
      { status: 401 },
    );
  }
}
