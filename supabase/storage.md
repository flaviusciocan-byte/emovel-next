# EMOVEL AI V1 Storage

Phase 0 defines one Supabase Storage bucket:

- `pdf_exports`
- private: `true`
- allowed MIME types: `application/pdf`
- file size limit: `10485760`

Rules:

- Do not make this bucket public.
- Do not expose direct public URLs.
- PDF export is Pro-only in V1.
- Signed URLs must be generated server-side only.
- The browser must never receive the Supabase service role key.

Recommended object path for Phase 2:

```txt
{user_id}/{workspace_id}/{project_id}/{export_id}.pdf
```
