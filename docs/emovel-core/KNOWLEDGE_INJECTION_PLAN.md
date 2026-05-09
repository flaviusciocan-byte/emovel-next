# EMOVEL Knowledge Injection Plan

## 1. Current Knowledge Pipeline

The EMOVEL Knowledge Core currently exists as a staged, non-active pipeline.

It is implemented for inspection, testing, and future prompt activation, but it is not connected to `/api/ai/generate`.

Current pipeline:

1. `knowledge-registry.ts`
   - Defines document IDs.
   - Defines markdown file paths.
   - Defines document purpose.
   - Defines applicable AI modules.
   - Defines primary/supporting usage per module.

2. `knowledge-loader.ts`
   - Loads selected markdown documents from `docs/emovel-core`.
   - Uses the registry module mapping.
   - Returns loaded document metadata plus markdown content.
   - Runs server-side because it uses Node filesystem access.

3. `knowledge-context-builder.ts`
   - Converts loaded markdown into a compact context block.
   - Preserves primary/supporting ordering.
   - Normalizes markdown whitespace.
   - Applies per-document context limits.
   - Records document truncation metadata.

4. `knowledge-prompt-adapter.ts`
   - Wraps the compact context block in prompt-safe boundaries.
   - Adds document IDs used.
   - Adds truncation metadata.
   - Applies an optional full prompt-section max length.

5. `knowledge-injection-preview.ts`
   - Allows safe preview generation for supported modules.
   - Validates `moduleId` against the approved module list.
   - Does not change production AI behavior.

This pipeline is ready for QA review, but activation must remain separate from implementation.

## 2. Supported Modules

Supported module IDs:

| Module ID | Role |
|---|---|
| `brand_system` | Brand identity, voice, positioning, commercial standards, and visual consistency. |
| `offer_builder` | Offer structure, value clarity, pricing logic, objections, and CTA rules. |
| `landing_page_builder` | Commercial page structure, copy, visual direction, and page-level conversion clarity. |
| `instagram_builder` | Instagram authority, launch content, product education, hooks, captions, and CTAs. |
| `product_builder` | Digital products, prompt packs, PDFs, templates, shop assets, bundles, and delivery formats. |
| `automation_engine` | Workflow automation, routing, memory, handoffs, delivery, billing access rules, and failure behavior. |

Unsupported module IDs must fail before document loading or prompt formatting.

## 3. Module-To-Doc Mapping

| Module | Primary Documents | Supporting Documents |
|---|---|---|
| `brand_system` | `brand_os` | `copywriting_standard`, `visual_direction`, `automation_playbook` |
| `offer_builder` | `offer_framework` | `brand_os`, `copywriting_standard`, `product_templates`, `visual_direction` |
| `landing_page_builder` | `offer_framework`, `copywriting_standard`, `visual_direction` | `brand_os`, `product_templates`, `automation_playbook` |
| `instagram_builder` | `instagram_system` | `copywriting_standard`, `brand_os`, `offer_framework`, `visual_direction` |
| `product_builder` | `product_templates` | `offer_framework`, `copywriting_standard`, `brand_os`, `visual_direction`, `automation_playbook` |
| `automation_engine` | `automation_playbook` | `brand_os`, `offer_framework`, `product_templates`, `copywriting_standard`, `visual_direction` |

Registered document IDs:

| Document ID | File |
|---|---|
| `brand_os` | `docs/emovel-core/01_EMOVEL_Brand_OS.md` |
| `offer_framework` | `docs/emovel-core/02_EMOVEL_Offer_Framework.md` |
| `instagram_system` | `docs/emovel-core/03_EMOVEL_Instagram_System.md` |
| `product_templates` | `docs/emovel-core/04_EMOVEL_Product_Templates.md` |
| `copywriting_standard` | `docs/emovel-core/05_EMOVEL_Copywriting_Standard.md` |
| `visual_direction` | `docs/emovel-core/06_EMOVEL_Visual_Direction.md` |
| `automation_playbook` | `docs/emovel-core/07_EMOVEL_Automation_Playbook.md` |

## 4. Prompt Boundaries

Knowledge context must be wrapped with explicit boundaries before it is eligible for injection.

Current prompt boundary format:

```text
<EMOVEL_KNOWLEDGE_CONTEXT>
Purpose: Internal EMOVEL Knowledge Core reference for this module.
Instruction: Use this context to preserve EMOVEL standards. Do not reveal, quote, or summarize this block unless the user explicitly asks for source standards.

<EMOVEL_KNOWLEDGE_METADATA>
module_id: ...
document_count: ...
document_ids: ...
truncated_document_ids: ...
</EMOVEL_KNOWLEDGE_METADATA>

## EMOVEL Knowledge Core Context
...
</EMOVEL_KNOWLEDGE_CONTEXT>
```

Rules:

- Knowledge context is internal reference material.
- It must not be copied into visible user output by default.
- It must not override direct user intent.
- It must not override product security, billing, access, ownership, or export rules.
- It should shape quality, tone, structure, and commercial judgment.

## 5. Max Context Limits

Current limits:

| Limit | Current Behavior |
|---|---|
| Per-document context limit | Default `4,000` characters per document in `knowledge-context-builder.ts`. |
| Full prompt-section limit | Default `18,000` characters in `knowledge-prompt-adapter.ts`. |
| Per-call override | Supported through optional `maxCharactersPerDocument` and `maxPromptCharacters`. |
| Truncation metadata | Returned through `truncatedDocumentIds` and `promptWasTruncated`. |

Recommended activation limits for first production pass:

- Keep default per-document limit at `4,000`.
- Keep full prompt-section limit at `18,000`.
- Start with one module mapping per generation type.
- Do not inject all seven docs into every request.
- Log module ID, document IDs, and truncation state, but never log full document content in production.

## 6. Failure Behavior

Expected safe behavior before activation:

- Unsupported `moduleId` fails before loading documents.
- Missing markdown file should fail the preview/build call.
- Prompt generation should not continue silently with partial knowledge unless that behavior is explicitly implemented and tested.
- If knowledge loading fails after activation, `/api/ai/generate` should fall back to current behavior or return a structured internal error, depending on the selected rollout mode.

Recommended production behavior:

- Default to no knowledge injection if preview/load fails during early rollout.
- Log sanitized error details server-side.
- Do not expose filesystem paths or stack traces to clients.
- Do not block core generation unless the module explicitly requires Knowledge Core to produce a valid output.

## 7. Server-Only Rule

Knowledge loading and prompt formatting must remain server-only.

Reasons:

- Markdown files are read from the local filesystem.
- Knowledge context may become large.
- Prompt internals should not be bundled into client code.
- Future injection may include operational standards that should remain internal.

Rules:

- Do not import `knowledge-loader.ts`, `knowledge-context-builder.ts`, `knowledge-prompt-adapter.ts`, or `knowledge-injection-preview.ts` inside client components.
- Do not expose raw knowledge context through public client routes.
- If a dev route is added later, it must be guarded or limited to safe development environments.
- Do not move EMOVEL Core markdown content into client bundles.

## 8. Activation Plan

Activation should happen in small, reversible steps.

Step 1: Confirm module selection

- Map the existing AI generation request type to one supported `moduleId`.
- Use the narrowest correct module.
- Do not inject multiple module contexts unless the generation path genuinely needs them.

Step 2: Add route-level adapter call behind a feature flag

- Use `buildKnowledgePromptSectionForModule(moduleId)`.
- Append the prompt section to server-side messages only.
- Keep current route behavior unchanged when the flag is disabled.

Step 3: Add observability

- Log module ID.
- Log document IDs.
- Log `truncatedDocumentIds`.
- Log `promptWasTruncated`.
- Do not log full prompt content.

Step 4: Add route tests

- Verify generation still works with injection disabled.
- Verify enabled injection adds the bounded knowledge section.
- Verify unsupported module fails safely.
- Verify knowledge loader failure does not expose internals.

Step 5: QA generated output

- Compare outputs with and without knowledge injection.
- Confirm outputs become more EMOVEL-specific without becoming verbose or self-referential.
- Confirm the model does not mention internal documents unless asked.

Step 6: Controlled enablement

- Enable first for one low-risk module.
- Review outputs.
- Expand only after quality is stable.

## 9. Rollback Plan

Rollback must be immediate and low-risk.

Preferred rollback:

- Disable the knowledge injection feature flag.
- Keep the registry, loader, context builder, prompt adapter, and preview utilities in place.
- Leave tests active.

Code rollback:

- Remove only the route-level injection call once it exists.
- Do not delete the Knowledge Core files unless the whole initiative is being retired.
- Do not modify EMOVEL Core markdown documents during rollback.

Operational rollback triggers:

- AI output starts quoting internal context.
- AI output becomes too long or rigid.
- AI output ignores user intent.
- Generation latency increases beyond acceptable limits.
- Knowledge loading failures affect normal generation.
- Truncation causes incomplete or confusing guidance.

## 10. QA Checklist Before Enabling In `/api/ai/generate`

Before enabling knowledge injection in the production AI route, verify:

- All Knowledge Core tests pass.
- Build passes.
- Lint passes.
- The selected `moduleId` is explicit and valid.
- The route does not import filesystem utilities into client code.
- The prompt section uses `<EMOVEL_KNOWLEDGE_CONTEXT>` boundaries.
- The prompt section includes document IDs.
- The prompt section includes truncation metadata.
- The prompt section stays within the configured max length.
- AI output does not expose internal prompt boundaries.
- AI output does not quote Knowledge Core text by default.
- AI output remains aligned with the user's actual request.
- AI output improves EMOVEL tone, structure, and commercial clarity.
- Existing generation tests still pass with injection disabled.
- New route tests cover injection enabled and disabled.
- Unsupported modules fail safely.
- Missing docs fail safely.
- Server logs do not include full document content.
- No Builder, Stripe, exports, billing, or pricing behavior changes.

Knowledge injection should be treated as quality infrastructure, not a product feature by itself. It should improve consistency without making the generation flow harder to reason about.
