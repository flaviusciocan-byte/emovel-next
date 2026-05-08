# Phase 4.3 Export QA

## Scope

Phase 4.3 stabilizes the existing export system before Stripe activation.

Included:
- Markdown and TXT export verification
- Private Pro-only PDF export verification
- Builder export state verification
- Supabase Storage safety checks

Excluded:
- Stripe checkout
- Payment state changes
- Dashboard
- Builder redesign
- AI generation changes
- Public PDF files
- New export formats

## Server Flow Audit

Markdown and TXT:
- `POST /api/exports/markdown` and `POST /api/exports/txt` require Bearer auth.
- Project ownership is checked through `getProjectWithSections(context, workspace.id, projectId)`.
- Accepted sections are exported first.
- If no accepted sections exist, ready sections are exported with a warning.
- Empty projects return safe export content.
- `recordExport` is non-blocking for Markdown/TXT.

PDF:
- `POST /api/exports/pdf` requires Bearer auth.
- Missing `projectId` returns `400 invalid_request`.
- Missing or non-owned project returns `404 not_found`.
- Free plan returns `403 billing_gate` with `PDF_EXPORT_REQUIRES_PRO`.
- PDF generation runs server-side with `pdfkit`.
- PDF upload uses private Supabase Storage bucket `pdf_exports`.
- PDF object path is `userId/projectId/exportId.pdf`.
- `pdf_exports` row is created after upload.
- A short signed URL is generated server-side and returned to the browser.
- Generic `exports` history is recorded with `format = pdf` when available.

## Storage Safety

Required Supabase setup:
- Bucket id/name: `pdf_exports`
- Bucket public flag: `false`
- Allowed MIME type: `application/pdf`
- File size limit: `10485760`
- No public `storage.objects` read policy

Server requirements:
- `SUPABASE_SERVICE_ROLE_KEY` must exist only in server runtime.
- Browser must never receive the service role key.
- Browser receives only the signed URL.
- Signed URL expiry is explicit: 15 minutes.

Manual storage validation:
1. In Supabase, confirm `storage.buckets.public = false` for `pdf_exports`.
2. Confirm no public policy exists for `storage.objects` on `pdf_exports`.
3. Export a PDF as a Pro user.
4. Confirm object path follows `userId/projectId/exportId.pdf`.
5. Open the returned signed URL and confirm the PDF loads.
6. Remove the token query string or use the raw object URL and confirm access is denied.
7. Wait past expiry or reduce expiry in a test environment and confirm the signed URL stops working.

## Free User QA

Expected:
- Markdown and TXT exports remain available for authenticated persisted projects.
- PDF button is locked/disabled in Builder.
- PDF route returns:
  - status `403`
  - code `PDF_EXPORT_REQUIRES_PRO`
  - category `billing_gate`
- No PDF is generated.
- No Storage object is created.
- No `pdf_exports` row is created.
- No AI usage is incremented.
- No section is marked accepted.

## Pro User QA

Expected:
- PDF button is enabled for authenticated persisted projects.
- PDF route returns:
  - `fileName`
  - `signedUrl`
  - `expiresAt`
  - `exportId`
  - `warnings`
- PDF is stored in private `pdf_exports`.
- `pdf_exports.storage_path` matches the returned export id path.
- Generic `exports` row is recorded with `format = pdf`.
- Accepted sections are preferred.
- Ready sections fallback includes the same warning as Markdown/TXT.
- Empty projects export a safe PDF with an empty-state message.

## Local Mode QA

Expected:
- Unauthenticated local mode cannot call server PDF export.
- Builder shows sign-in required copy.
- Local generation credits are not connected to server PDF export.
- No PDF Storage object or `pdf_exports` row is created.

## Error State QA

Route responses are structured:

```json
{
  "error": "PDF signed URL creation failed.",
  "code": "PDF_SIGNED_URL_FAILED",
  "category": "signed_url_failed"
}
```

Expected mappings:
- `AUTH_REQUIRED`: sign in required
- `PROJECT_REQUIRED`: persisted project required
- `PROJECT_NOT_FOUND`: project unavailable or not owned
- `PDF_EXPORT_REQUIRES_PRO`: Pro required
- `PDF_GENERATION_FAILED`: server PDF generation failed
- `PDF_STORAGE_FAILED`: private Storage upload failed
- `PDF_SIGNED_URL_FAILED`: signed URL creation failed
- `PDF_EXPORT_RECORD_FAILED`: export history write failed

## Known Risks

- Current PDF layout is intentionally simple V1 and not a polished report template.
- Route tests mock Supabase Storage; live Storage behavior still needs staging verification.
- `recordPdfExport` uses service role because user RLS has select-only policy for `pdf_exports`.
- If `SUPABASE_SERVICE_ROLE_KEY` is missing in production, PDF export fails.
- Signed URL access depends on Supabase Storage configuration and project URL correctness.
- `npm audit` currently reports moderate vulnerabilities from the dependency tree; no automatic fix has been applied.

## Phase 5 Readiness Gate

Before Stripe activation:
- Confirm Pro plan assignment works manually in Supabase.
- Verify free-to-Pro state refresh in `/api/account/session`.
- Run this checklist in staging with one free user and one Pro user.
- Confirm no payment state is inferred from client-only data.
- Keep Stripe activation separate from export logic.
