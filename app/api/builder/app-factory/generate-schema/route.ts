import { createAppFactorySchemaWithAIAdapterV0 } from "../../../../../lib/emovel/ai/app-factory-ai-adapter";
import { validateEmovelAppSchemaV0 } from "../../../../../lib/emovel/schema/validate-app-schema.v0";
import { EMOVEL_THEME_PACKS_V0 } from "../../../../../lib/emovel/themes/theme-packs";

interface GenerateSchemaRequestBody {
  prompt?: unknown;
  themePackId?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function parseRequestBody(request: Request): Promise<GenerateSchemaRequestBody> {
  try {
    const body = await request.json();

    return isRecord(body) ? body : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await parseRequestBody(request);

  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
    return Response.json(
      {
        success: false,
        error: "Prompt is required.",
      },
      { status: 400 },
    );
  }

  const result = createAppFactorySchemaWithAIAdapterV0({
    prompt: body.prompt,
  });

  if (typeof body.themePackId === "string") {
    const selectedThemePack = EMOVEL_THEME_PACKS_V0.find(
      (themePack) => themePack.packId === body.themePackId,
    );

    if (selectedThemePack) {
      const { label: _label, ...theme } = selectedThemePack;
      result.schema.theme = theme;
    }
  }

  const validation = validateEmovelAppSchemaV0(result.schema);

  return Response.json({
    success: true,
    result,
    validation,
  });
}
