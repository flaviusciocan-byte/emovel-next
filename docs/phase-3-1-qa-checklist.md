# EMOVEL Phase 3.1 QA Checklist

| Test case | Expected result | Status | Notes |
| --- | --- | --- | --- |
| Public `/` route | Home renders without auth. | Pass by code audit | No auth requirement on home. |
| Public `/auth` route | Auth page renders sign in/sign up and uses global session. | Pass by code audit | Uses `useAuthSession()`. |
| Unauthenticated `/builder` | Builder opens in local mode. | Pass by code audit | Shows “Local mode: sign in to save projects and continue later.” |
| Local Builder generation | Local fallback can generate without backend persistence. | Pass by code audit | Uses legacy local credits only when unauthenticated. |
| Authenticated sign in | Session is stored and global provider loads user/profile/workspace/plan. | Pass by code audit | Invalid stored token is cleared. |
| Brand Profile route without auth | Shows a sign-in gate, not an editable form. | Pass by code audit | Auth-required behavior enforced client-side. |
| Brand Profile save with auth | Saves profile and advances onboarding to `first_project`. | Pass by code audit | Uses `/api/onboarding/brand-profile`. |
| Authenticated Builder bootstrap | Loads workspace, latest persisted project, and Brand Context. | Pass by code audit | Uses `/api/builder/bootstrap`. |
| Valid commercial prompt | Boundary allows commercial UI, brand, monetization, production, and client deliverable intent. | Pass by code audit | Examples include offer/landing page/positioning/product prompts. |
| Non-production prompt | Boundary blocks or asks clarification for unrelated/general prompts. | Pass by code audit | Deny-by-default remains. |
| Provider not configured in development | API returns `provider_not_configured` with local fallback allowed. | Pass by code audit | Does not increment backend usage. |
| Provider not configured in production | API returns `provider_not_configured` without local fallback. | Pass by code audit | Does not persist generated sections or increment usage. |
| Successful AI generation | Streams response, validates Template Spec v1, persists sections/drafts, records generation, increments usage. | Pass by code audit | Requires configured provider and Supabase. |
| Blocked/rate/provider errors | Do not increment usage. | Pass by code audit | Some paths still create audit rows in `ai_generations`. |
| Refresh persisted Builder | Latest project/spec snapshot is restored from persisted section content. | Pass by code audit | Uses `specSnapshot`. |
| Explicit accept | `Accept Sections` sets `accepted` through explicit section PATCH. | Pass by code audit | User action only. |
| Copy manifest | Does not set accepted. | Pass by code audit | Clipboard only. |
| Download manifest | Does not set accepted. | Pass by code audit | Local download only. |
| Build | `npm.cmd run build` passes. | Pass | Passed after Phase 3.1 stabilization. |
| Lint | `npm.cmd run lint` passes. | Pass | Fixed existing hook lint issue in assistants marketing output system. |

## Route Policy

Public:
- `/`
- `/auth`

Hybrid:
- `/builder` works locally without auth and persists only when authenticated.

Auth required:
- `/onboarding/brand-profile`
- future `/settings`
- future `/billing`
- future `/exports`

## Migration Discipline

No database change is required for Phase 3.1. Do not modify the already-applied Phase 0 migration.
