import { requireAuth } from "../../../../../lib/auth/session";
import {
  getOrCreateUserWorkspace,
  getProjectWithSections,
} from "../../../../../lib/emovel-ai/data-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const { user, accessToken } = await requireAuth(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return Response.json({ error: "Unable to load personal workspace." }, { status: 500 });
    }

    const project = await getProjectWithSections(context, workspace.id, projectId);

    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    return Response.json({ project, workspace });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Project load failed." },
      { status: 400 },
    );
  }
}
