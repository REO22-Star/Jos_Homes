# Operations runbook (Milestone 7)

For the controlled Jos pilot, with a human on call. Fill in the bracketed values
before launch.

## On-call & contacts

- Product/ops owner: `[name, phone]`
- Engineer on call: `[name, phone]`
- Supabase project: `[dashboard URL]`
- Host (Vercel) project: `[dashboard URL]`
- Status/incident channel: `[channel]`

## Observability

- **Health:** `GET /api/health` — reports data/auth backend. Wire an uptime
  monitor (e.g. a 1-minute check) against it.
- **Logs:** structured JSON via `src/lib/observability/logger.ts`. Errors flow
  through `captureError`; wire a provider (Sentry/Logtail) there at deploy time.
- **User-facing errors** never show stack traces or SQL (acceptance L5) — the app
  error boundary shows a safe message and logs the detail server-side only.

## Backups & recovery

- Supabase provides automated daily backups (verify the retention on the project
  plan). Additionally: `[schedule a periodic pg_dump to off-site storage]`.
- **Restore drill (do once before pilot):** restore the latest backup into a
  scratch project, run the app against it, confirm listings load. Record the RTO.
- Migrations are the source of truth for schema; never hand-edit production schema
  outside a migration.

## Incident response checklist

1. Acknowledge in the incident channel; note start time.
2. Assess scope: is private data exposed? is the site down? is it a single listing/lister?
3. Contain:
   - Bad listing → moderator **Suspend** (Review) or **Place under review** (Reports).
   - Bad actor → admin **Suspend lister** (from a report resolution).
   - Suspected data exposure → rotate `SESSION_SECRET` and Supabase keys; redeploy.
4. Communicate: update the channel; if user data is affected, follow the breach
   process and obtain legal review before external notice.
5. Resolve & record: what happened, blast radius, fix, follow-ups. File the audit
   references (admin **Audit log** search).

## Content moderation & support playbook

- **Review queue** (`/dashboard/review`): approve, request changes (with a
  reason), reject, or suspend submitted listings. Only staff; a lister can never
  self-approve.
- **Reports** (`/dashboard/reports`): dismiss, place under review, warn, or
  suspend the lister. A report never changes a listing automatically. The
  reporter's identity is never shown to the lister.
- **Availability queue** (Admin → overview): reconfirm/close stale listings.
- **Verification** (Admin): issue/revoke badges. A badge states only what was
  checked; paying for a service never auto-grants a badge; evidence is admin-only.
- Support: respond via `/contact`; for account or data requests see retention below.

## Data retention & deletion (see OQ-013)

Proposed pilot retention — confirm with legal review before launch:

| Data | Retention |
| --- | --- |
| Rejected media | `[e.g. 30 days]` then purge |
| Verification evidence | `[e.g. 1 year]`; restricted to admins |
| Detailed view events | `[e.g. 30 days]` then roll into daily aggregates |
| Inquiry contact details | `[e.g. 12 months]` |
| Reports | `[e.g. 12 months]` |
| Audit logs | `[e.g. 2 years]` |
| Closed accounts | Purge personal data; keep anonymized aggregates |

- **Self-service deletion:** signed-in users can delete their saved homes,
  searches, and notifications from **Dashboard → Preferences → Delete my data**.
- **Account deletion request:** `[document the operator process — remove profile,
  anonymize authored content, retain audit references]`.

## Pre-launch compliance (docs PRD §29)

Obtain qualified local review of privacy/retention, terms & acceptable use,
paid-promotion consumer implications, advertising/agency disclosures, verification
wording, handling of minors/vulnerable users, and incident/breach procedures.
This document is operational guidance, not legal advice.
