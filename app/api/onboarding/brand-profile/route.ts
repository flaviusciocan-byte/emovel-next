import { requireAuth } from "../../../../lib/auth/session";
import {
  getCurrentProfile,
  getOrCreateUserWorkspace,
  getBrandProfile,
  updateBrandProfile,
  updateOnboardingStep,
} from "../../../../lib/emovel-ai/data-access";
import type { BrandProfileInput } from "../../../../lib/emovel-ai/types";

function normalizeBrandProfileInput(value: unknown): BrandProfileInput {
  const payload = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const brandName = typeof payload.brand_name === "string" ? payload.brand_name.trim() : "";

  if (!brandName) {
    throw new Error("Brand name is required.");
  }

  return {
    brand_name: brandName,
    audience: typeof payload.audience === "string" ? payload.audience.trim() || null : null,
    tone: typeof payload.tone === "string" ? payload.tone.trim() || null : null,
    visual_direction:
      typeof payload.visual_direction === "string" ? payload.visual_direction.trim() || null : null,
    offer_positioning:
      typeof payload.offer_positioning === "string" ? payload.offer_positioning.trim() || null : null,
  };
}

export async function GET(request: Request) {
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

    const [profile, brandProfile] = await Promise.all([
      getCurrentProfile(context),
      getBrandProfile(context, workspace.id),
    ]);

    return Response.json({ profile, workspace, brandProfile });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Brand Profile load failed." },
      { status: 401 },
    );
  }
}

export async function PATCH(request: Request) {
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

    const input = normalizeBrandProfileInput(await request.json());
    const brandProfile = await updateBrandProfile(context, workspace.id, input);
    const profile = await updateOnboardingStep(context, "first_project");

    return Response.json({ profile, workspace, brandProfile });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Brand Profile save failed." },
      { status: 400 },
    );
  }
}
