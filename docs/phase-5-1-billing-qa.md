# Phase 5.1 Billing QA

## Scope

Phase 5.1 stabilizes Stripe Pro subscription billing before production exposure.

Included:
- Stripe Checkout QA
- Stripe Customer Portal QA
- Webhook signature and idempotency QA
- `subscriptions` and `profiles.plan` sync QA
- `/api/account/session` plan refresh QA
- Builder PDF unlock QA

Excluded:
- Stripe pricing redesign
- Dashboard
- Agency plans
- Usage-based billing
- AI generation changes
- PDF storage behavior changes

## Required Environment Variables

Server-only:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `SUPABASE_SERVICE_ROLE_KEY`

Public/runtime:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Rules:
- Do not expose `STRIPE_SECRET_KEY` to client components.
- Do not expose `STRIPE_WEBHOOK_SECRET` to client components.
- Do not expose `STRIPE_PRO_PRICE_ID` to client components.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Stripe CLI Setup

Install and authenticate Stripe CLI, then forward local webhooks:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret from the CLI output into:

```txt
STRIPE_WEBHOOK_SECRET=whsec_...
```

Use a real test-mode recurring price id:

```txt
STRIPE_PRO_PRICE_ID=price_...
```

## Test Card Flow

Use Stripe test card:

```txt
4242 4242 4242 4242
Any future expiry
Any CVC
Any ZIP
```

Expected:
- Checkout completes.
- Stripe redirects to `/builder?billing=success`.
- Webhook receives `checkout.session.completed`.
- Webhook then syncs subscription/profile state.

## Checkout Success Checklist

1. Sign in as a Free user.
2. Open `/billing`.
3. Click `Upgrade to Pro`.
4. Confirm Checkout Session opens on Stripe.
5. Complete payment with test card.
6. Confirm redirect to Builder.
7. Confirm `stripe_events` contains the processed checkout event.
8. Confirm `subscriptions.stripe_customer_id` is present.
9. Confirm `subscriptions.stripe_subscription_id` is present.
10. Confirm `subscriptions.status` is `active` or `trialing`.
11. Confirm `subscriptions.plan` is `pro`.
12. Confirm `profiles.plan` is `pro`.
13. Refresh Builder and confirm PDF button is unlocked.

## Checkout Cancel Checklist

1. Sign in as a Free user.
2. Open `/billing`.
3. Start Checkout.
4. Cancel from Stripe Checkout.
5. Confirm redirect to `/billing?billing=cancelled`.
6. Confirm `profiles.plan` remains `free`.
7. Confirm PDF button remains locked.
8. Confirm no active Pro subscription is created.

## Customer Portal Checklist

1. Use an account with `stripe_customer_id`.
2. Open `/billing`.
3. Click `Manage Billing`.
4. Confirm Stripe Customer Portal opens.
5. Return to `/billing`.
6. Confirm no client-side Stripe secret is exposed.

No customer expected behavior:
- Portal route returns `404`.
- Response code is `STRIPE_CUSTOMER_REQUIRED`.
- Category is `not_found`.
- UI tells the user to upgrade before opening the portal.

## Webhook Idempotency Checklist

1. Complete a Checkout flow.
2. Confirm event row is inserted into `stripe_events`.
3. Confirm `processed = true`.
4. Replay the same event from Stripe CLI or Dashboard.
5. Confirm the API returns duplicate success.
6. Confirm subscription/profile updates are not applied twice.

## Subscription Cancel / Downgrade Checklist

1. Open Stripe Customer Portal.
2. Cancel the Pro subscription.
3. Confirm webhook receives `customer.subscription.deleted` or updated inactive status.
4. Confirm `subscriptions.status` reflects cancellation.
5. Confirm `subscriptions.plan` is `free`.
6. Confirm `profiles.plan` is `free`.
7. Refresh `/api/account/session`.
8. Confirm `planLimits.canExportPdf = false`.
9. Refresh Builder and confirm PDF button is locked.

## PDF Unlock Verification

Free user:
- Markdown/TXT remain available for persisted projects.
- PDF export button remains disabled.
- Direct PDF API returns `PDF_EXPORT_REQUIRES_PRO`.

Pro user:
- PDF export button is enabled after session refresh.
- Direct PDF API succeeds.
- PDF remains private in `pdf_exports`.
- Browser receives only signed URL.

Webhook pending:
- If Stripe redirects before webhook processing finishes, the UI may still show Free briefly.
- Refresh `/api/account/session` or reload Builder after a few seconds.
- Do not trust Checkout success URL as proof of Pro.

## Known Risks

- Stripe webhook delivery can lag behind Checkout redirect.
- Stripe CLI must use the same webhook secret configured locally.
- `profiles.plan` is the app gate, so webhook failure blocks Pro unlock.
- Customer Portal availability depends on Stripe Dashboard portal configuration.
- `npm audit` reports moderate vulnerabilities through the current Next/PostCSS dependency chain; no forced fix has been applied.

## Production Readiness Gate

Before public exposure:
- Run the full checklist in Stripe test mode.
- Confirm all production env vars exist in Vercel.
- Confirm webhook endpoint is registered in Stripe Dashboard.
- Confirm webhook secret matches the production endpoint, not local CLI.
- Confirm a failed payment path does not unlock Pro.
- Confirm canceled subscription downgrades access.
