# Phase 3.2 Test Harness

## Scope

Phase 3.2 adds a minimal Vitest harness for pure AI and business-logic checks before Phase 4.

No product features, provider integrations, dashboard work, Stripe, PDF export, Builder redesign, or Code Brain work were added.

## Tests Added

- `tests/ai/boundary.test.ts`
  - Confirms commercial prompts with words like "explain", "what is", and "how" are allowed when the intent is commercial.
  - Confirms general knowledge, entertainment, regulated advice, unrelated coding, and trivia/history prompts are blocked.

- `tests/ai/model-registry.test.ts`
  - Confirms provider/model config is environment-driven.
  - Confirms missing provider/model config fails safely.
  - Confirms configured providers without server keys are excluded.
  - Checks that the AI generation route uses the registry instead of concrete hardcoded model IDs.

- `tests/ai/spec-json.test.ts`
  - Confirms a valid Template Spec v1 parses.
  - Confirms JSON fenced output parses.
  - Confirms missing JSON fails safely.
  - Confirms missing required Template Spec fields fail validation.

## Commands

- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd test`

## Remaining Risks

- Route error-category tests were not added because the category mapping remains inside `app/api/ai/generate/route.ts`. Extracting it would be a production-code refactor and is better handled only if Phase 4 needs broader endpoint testing.
- The tests are pure unit tests. They do not validate live Supabase RLS, authenticated browser sessions, or real provider streaming.
- The route source check is intentionally lightweight. It prevents obvious hardcoded model IDs in the route handler, but it is not a full static-analysis rule.
