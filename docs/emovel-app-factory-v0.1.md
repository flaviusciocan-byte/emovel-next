# EMOVEL App Factory v0.1

## What Exists Now

EMOVEL App Factory v0.1 provides the first controlled internal path from a product prompt to a typed generated app schema.

Current capabilities:
- deterministic prompt-to-brief and prompt-to-schema compiler
- typed EMOVEL App Schema v0 model
- schema validator with structured errors
- controlled AI adapter placeholder with no external AI calls
- internal API route for schema generation
- internal UI page for prompt entry, local prompt improvement, generation, validation display, JSON copy, JSON download, and clear/reset

## Current Flow

Prompt -> Improve Prompt -> Generate -> Schema -> Validation -> Copy/Download/Clear

Details:
- The user writes or selects a prompt preset.
- The UI can improve Weak or Good prompts locally with deterministic EMOVEL prompt structure.
- Generate calls the internal API route.
- The API uses the deterministic AI adapter placeholder.
- The generated schema is validated before the response is returned.
- The UI displays the full API response, schema summary, validation status, and JSON output.
- The user can copy, download, or clear the result.

## Files Involved

Core schema:
- `lib/emovel/schema/app-schema.v0.ts`
- `lib/emovel/schema/schema-errors.v0.ts`
- `lib/emovel/schema/validate-app-schema.v0.ts`
- `lib/emovel/schema/example-app-schema.json`

Compiler:
- `lib/emovel/compiler/prompt-to-brief.ts`
- `lib/emovel/compiler/prompt-to-schema.ts`

AI adapter:
- `lib/emovel/ai/ai-adapter-types.ts`
- `lib/emovel/ai/app-factory-ai-adapter.ts`

Registry, theme, QA:
- `lib/emovel/registry/component-types.ts`
- `lib/emovel/registry/components.registry.ts`
- `lib/emovel/themes/theme-packs.ts`
- `lib/emovel/themes/visual-archetypes.ts`
- `lib/emovel/qa/output-checklist.ts`

API and UI:
- `app/api/builder/app-factory/generate-schema/route.ts`
- `app/builder/app-factory/page.tsx`

Tests:
- `tests/emovel/app-factory-foundation.test.ts`

## Intentionally Not Included Yet

Not included in v0.1:
- external AI provider calls
- external repository integration
- UI generation from schema
- live component rendering from the App Factory schema
- persistence or project saving
- authentication or billing gates for App Factory
- deployment logic
- mobile runtime
- navigation integration
- commercial page or existing Builder flow changes

## Next Recommended Step

Add route-level tests for `POST /api/builder/app-factory/generate-schema`, covering:
- missing prompt returns `400`
- valid prompt returns `{ success, result, validation }`
- generated schema validates successfully
- no external AI provider is called
