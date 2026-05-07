import { requireAuth } from "../../../../lib/auth/session";
import {
  checkPlanLimit,
  createProject,
  getOrCreateUserWorkspace,
  updateOnboardingStep,
} from "../../../../lib/emovel-ai/data-access";
import type { ProjectInput } from "../../../../lib/emovel-ai/types";

export async function POST(request: Request) {
  try {
    const { user, accessToken } = await requireAuth(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return Response.json({ error: "Unable to load personal workspace." }, { status: 500 });
    }

    const planGate = await checkPlanLimit(context, workspace.id, "create_project");

    if (!planGate.allowed) {
      return Response.json({ error: planGate.reason }, { status: 403 });
    }

    const payload = (await request.json()) as ProjectInput;
    const project = await createProject(context, workspace.id, payload);

    if (project) {
      await updateOnboardingStep(context, "complete");
    }

    return Response.json({ project, workspace });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Project creation failed." },
      { status: 400 },
    );
  }
}
