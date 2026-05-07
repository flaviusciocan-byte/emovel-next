# Phase 4 Export System

## Scope

Phase 4 adds production-safe Markdown and TXT exports for existing Builder projects.

No Stripe checkout, PDF export, dashboard, Code Brain, drag-and-drop, marketplace/templates, new AI providers, Builder redesign, or AI generation changes were added.

## Routes Added

- `POST /api/exports/markdown`
- `POST /api/exports/txt`

Both routes:
- require an authenticated user
- load the current personal workspace
- verify project ownership through the existing project data-access path
- load project sections and brand context
- assemble export content server-side
- write an `exports` history record
- return JSON with `content`, `fileName`, `contentType`, section counts, and warnings

## Export Formats

- Markdown: `.md`, `text/markdown; charset=utf-8`
- TXT: `.txt`, `text/plain; charset=utf-8`

PDF remains out of scope for Phase 4.

## Gate Behavior

- Markdown/TXT export requires authentication and project ownership.
- Accepted sections are exported by default.
- If no accepted sections exist, ready sections can be exported with a clear warning.
- Empty projects return safe output instead of failing.
- Free plan PDF restrictions remain unchanged because PDF export is not implemented here.

## Persistence

Phase 4 adds a new `exports` table because `pdf_exports` is intentionally PDF-specific.

Fields:
- `id`
- `user_id`
- `workspace_id`
- `project_id`
- `format`
- `storage_path`
- `content_hash`
- `created_at`

RLS is enabled. Users can select and insert only their own workspace-scoped export rows.

## UI Integration

The existing Builder gets a minimal Export Center below the runtime preview.

It shows:
- project name
- accepted section count
- ready section count
- ready-section fallback warning
- Markdown copy/download
- TXT copy/download

The existing advanced manifest export remains unchanged.

## Tests Added

- Markdown includes project title.
- Sections are ordered by fixed section order.
- Internal metadata is excluded.
- Ready-section fallback warning is visible.
- Empty sections produce safe output.

## Remaining Risks

- Export history is recorded, but no export-history UI is implemented yet.
- API tests for authenticated route behavior are not included because that would require authenticated Supabase integration coverage.
- Export content reflects the current stored Builder section structure, which is page/spec oriented until richer final copy is generated.

## Phase 4.1 Recommendation

Implement PDF export as a separate gated Pro feature:
- use private Supabase Storage only
- write files to the existing private `pdf_exports` bucket
- return signed URLs only
- record rows in `pdf_exports`
- add route-level tests around gate/error behavior where pure helpers can be extracted safely
