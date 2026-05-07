import { getCurrentProfile, requireUser } from "../../../../lib/auth/session";
import {
  getBrandProfile,
  getOrCreateUserWorkspace,
  getProjects,
} from "../../../../lib/emovel-ai/data-access";

export async function GET(request: Request) {
  try {
    const { user, accessToken } = await requireUser(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return Response.json({ error: "Unable to load personal workspace." }, { status: 500 });
    }

    const [profile, brandProfile, projects] = await Promise.all([
      getCurrentProfile(request),
      getBrandProfile(context, workspace.id),
      getProjects(context, workspace.id),
    ]);

    return Response.json({
      user,
      profile,
      workspace,
      brandProfile,
      projects,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Builder bootstrap failed." },
      { status: 401 },
    );
  }
}
