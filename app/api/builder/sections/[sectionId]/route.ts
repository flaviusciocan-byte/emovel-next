import { requireUser } from "../../../../../lib/auth/session";
import {
  acceptSection,
  getOrCreateUserWorkspace,
  saveSectionDraft,
  updateSection,
} from "../../../../../lib/emovel-ai/data-access";
import type { SectionDraftSource, SectionInput } from "../../../../../lib/emovel-ai/types";

interface SectionPatchPayload {
  projectId: string;
  sectionKey: string;
  section: SectionInput;
  draft?: {
    content: Record<string, unknown>;
    source: SectionDraftSource;
  };
  accept?: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  try {
    const { sectionId } = await params;
    const { user, accessToken } = await requireUser(request);
    const context = {
      userId: user.id,
      accessToken,
    };
    const workspace = await getOrCreateUserWorkspace(context);

    if (!workspace) {
      return Response.json({ error: "Unable to load personal workspace." }, { status: 500 });
    }

    const payload = (await request.json()) as SectionPatchPayload;
    const section = payload.accept
      ? await acceptSection(context, workspace.id, sectionId)
      : await updateSection(context, workspace.id, sectionId, payload.section);

    const draft = payload.draft
      ? await saveSectionDraft(context, workspace.id, {
          projectId: payload.projectId,
          sectionId,
          sectionKey: payload.sectionKey,
          draftContent: payload.draft.content,
          source: payload.draft.source,
        })
      : null;

    return Response.json({ section, draft });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Section update failed." },
      { status: 400 },
    );
  }
}
