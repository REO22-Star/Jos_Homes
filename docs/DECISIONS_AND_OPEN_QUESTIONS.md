# Decisions and Open Questions

## Purpose

Use this file to prevent important product decisions from disappearing inside chat history. Update the status, owner, and date whenever a decision is made.

## Confirmed decisions

### D-001 - Start with the website

Status: Confirmed  
Decision: Build a mobile-first responsive website before a native app. Structure it so it can later become an installable PWA.

### D-002 - Focus on long-term residential rentals

Status: Confirmed  
Decision: The MVP excludes sales, land, commercial listings, hotels, and short-lets.

### D-003 - Public browsing without registration

Status: Confirmed  
Decision: Guests can search and open listings. Accounts are for listers and optional seeker features such as saves and alerts.

### D-004 - Separate views and inquiries

Status: Confirmed  
Decision: Qualified property-page views are not called interested parties. Inquiries require an explicit contact or inspection action.

### D-005 - Keep exact addresses private

Status: Confirmed  
Decision: Public pages show area, landmark, and approximate location only.

### D-006 - Freshness is a primary product feature

Status: Confirmed  
Decision: Every public listing shows when availability was last confirmed, and stale listings are eventually suppressed.

### D-007 - No in-platform payment in the MVP

Status: Confirmed  
Decision: The first release does not collect rent, deposits, agency fees, or inspection fees.

### D-008 - Transparent platform conflicts

Status: Confirmed  
Decision: In-house agency and sponsored listings are visibly labelled. They do not receive hidden priority.

### D-009 - Working technical stack

Status: Recommended and treated as default  
Decision: Next.js, TypeScript, PostgreSQL, and Supabase, with automated testing and mobile-first design.

## Milestone 0 build decisions

These were decided while implementing Milestone 0 (foundation + clickable public
prototype). They are implementation defaults and can be revisited by the product owner.

### D-010 - Styling approach

Status: Confirmed (Milestone 0)
Decision: Use CSS Modules plus a global design-token stylesheet (`src/app/globals.css`)
rather than a utility CSS framework. System font stack only — no web-font downloads.
Reason: Keeps JavaScript/CSS payloads small for low-bandwidth mobile connections
(First Load JS is ~102-111 kB) and avoids a build-time framework dependency.

### D-011 - Test tooling

Status: Confirmed (Milestone 0)
Decision: Vitest + Testing Library for unit/component tests; Playwright for browser
tests (mobile + desktop projects). Chosen for stable, well-supported tooling.

### D-012 - Fictional data layer stands in for the database

Status: Confirmed (Milestone 0)
Decision: A typed in-repo repository (`src/lib/data/`) materialises deterministic
fictional listings and runs them through the same public projection that the real
database queries will use in Milestone 1+. Time-relative fields are stored as offsets
and resolved against the request time so freshness labels stay stable.

### D-013 - Placeholder media only

Status: Confirmed (Milestone 0)
Decision: Property media are safe generated gradient tiles watermarked "Sample photo".
No real or copyrighted images are used. The `PublicMedia` shape already carries alt
text, moderation state (only `approved` is projected), and ordering for later milestones.

### D-014 - Prototype is not publicly indexable

Status: Confirmed (Milestone 0)
Decision: The app sends `robots: noindex` globally while it serves fictional data, to
avoid any prototype content being indexed. Removed before/at pilot.

### D-015 - Milestone 0 defaults for open questions

Status: Provisional (Milestone 0) — see the referenced OQ items
Decision: Applied these documented "recommended default" values so the prototype is
coherent, without foreclosing the open questions:

- Min images for a normal listing: 3 (OQ-004).
- Freshness windows: fresh 72h / recent 7d / overdue after 7d / suppress after 14d (OQ-008).
- Public phone: revealed only after a deliberate action (OQ-007); prototype shows a
  clearly fake number and never embeds a real one.
- Contact layout: neutral "Contact" group with Call and WhatsApp equally visible (OQ-009).
- Location: area + landmark + approximate label only; no map yet (OQ-010).
- Default search order: product relevance (sponsored first, then fresher, then more
  engaged), never price-first (PRD 11.2).

## Milestone 1 build decisions

Decided while implementing Milestone 1 (database, authentication, roles). The live
Supabase integration was authored but could not be executed against a real Postgres
in the build environment; see D-021.

### D-016 - Provider-abstracted data and auth

Status: Confirmed (Milestone 1)
Decision: Both the listing data layer (`ListingRepository`) and authentication
(`AuthProvider`) sit behind interfaces with two implementations: an in-memory
development backend (default) and a Supabase backend (used automatically when the
Supabase env vars are present). Both data backends return the same `PublicListing`
projection, so swapping them cannot change what is public.

### D-017 - Authentication method (resolves OQ-006 for the prototype)

Status: Confirmed (Milestone 1)
Decision: Email + password. Simplest to run deterministically with the dev mock and
to back with Supabase Auth. Separate phone verification will gate publishing in a
later milestone. Passwordless/OTP remain open for later reconsideration.

### D-018 - Stateless signed sessions; role never in the cookie

Status: Confirmed (Milestone 1)
Decision: The session cookie is an HMAC-signed token carrying only the profile id
and expiry. The role and account status are re-read from the provider on every
request, so a role change or suspension takes effect immediately and a forged role
can never be trusted from the cookie (acceptance C3/C4).

### D-019 - Two-layer authorization (app rules mirrored by RLS)

Status: Confirmed (Milestone 1)
Decision: `src/lib/domain/authorization.ts` is the single application-layer rule
table (`can`/`assertCan`), unit-tested for C1/C2/C3/E2/J3. The database RLS policies
in `0003_rls.sql` mirror the same rules and are the backstop if an app check is
missed. Both layers must be kept in agreement.

### D-020 - Public reads go only through the `public_listings` view

Status: Confirmed (Milestone 1)
Decision: anon/authenticated roles have their direct SELECT on base tables revoked;
all public listing reads go through a definer-rights view exposing only safe columns
(approved listings, approved media, valid badges, no private address/evidence/phone).
The privacy boundary is structural, not UI discipline.

### D-021 - Development-only auth boundary + in-memory store on globalThis

Status: Confirmed (Milestone 1)
Decision: The mock auth provider is refused in production unless
`JOSHOMES_ALLOW_DEV_AUTH=true` is explicitly set for a non-public demo. Its account
store is held on `globalThis` because the Next.js server runtime can evaluate a
module more than once, which would otherwise drop runtime-created accounts between
the sign-up request and the next request (a bug caught by the auth browser tests).

### D-022 - Live RLS enforcement not yet verified (open follow-up)

Status: Open follow-up (Milestone 1)
Decision: The schema, public view, and RLS policies were authored and the app wired
to them, but they were not executed against a real Postgres because none was
available at build time. The equivalent rules are unit-tested at the application
layer. Before pilot, run the RLS checks against a live database (see
docs/DEV_SETUP.md "Known verification gap").

## Milestone 2 build decisions

Decided while implementing Milestone 2 (lister submission and moderation).

### D-023 - Workflow is a pure state machine, separate from authorization

Status: Confirmed (Milestone 2)
Decision: `src/lib/domain/workflow.ts` encodes which workflow transitions are
structurally valid (draft→submitted→approved/changes_requested/rejected, etc.),
independent of who may perform them. A state change must satisfy BOTH the
transition (workflow) and the actor's permission (authorization.ts). This makes
"invalid status transitions are rejected" (D3) a small, tested unit.

### D-024 - Server-side validation with Zod; two schemas

Status: Confirmed (Milestone 2, resolves the Zod recommendation in D-009)
Decision: `listingDraftSchema` (lenient, for partial saves) and
`listingSubmissionSchema` (strict, enforces every field required to submit, D2).
Each required field carries a base error so a missing value yields an actionable
message. A `missingForSubmission` helper drives the editor's readiness checklist.

### D-025 - Writable authoring backend is in-memory (globalThis)

Status: Confirmed (Milestone 2); Supabase writes deferred with D-022
Decision: The submission→moderation→publish flow is built on a writable in-memory
store (`authoring-store.ts`, hung off `globalThis` for the same reason as the dev
auth store). Approved authored listings are unioned into the public read path
through the SAME `toPublicListing` projection, so the privacy boundary is
identical. When Supabase is provisioned, these operations map to DB writes under
the existing RLS; that path is verified together with the live-RLS gap (D-022).

### D-026 - Every write goes through one authoring service

Status: Confirmed (Milestone 2)
Decision: `src/lib/data/authoring.ts` is the single place M2 writes happen. Each
operation calls `assertCan` (authorization) and `assertWorkflowTransition`
(workflow), then appends an immutable status-history entry and an audit-log
entry. Server actions are thin wrappers. A lister can never self-approve, edit an
approved listing, or touch another lister's listing (C1/C2), enforced here and
covered by unit + browser tests.

## Milestone 3 build decisions

Decided while implementing Milestone 3 (media and listing quality).

### D-027 - Media storage abstraction with public/private namespaces

Status: Confirmed (Milestone 3); Supabase Storage deferred with D-025
Decision: `src/lib/media/storage.ts` exposes a namespaced blob store with a `public`
namespace (servable via `/api/media/[id]`) and a `private` namespace that the
public serve route never reads — so verification evidence cannot be fetched
through a public media URL or a guessed path (H4). The dev backend keeps bytes in
memory on `globalThis`; in a configured environment these map to Supabase Storage
buckets with matching policies.

### D-028 - Pure, server-side media validation

Status: Confirmed (Milestone 3)
Decision: `src/lib/domain/media.ts` validates every upload server-side —
allowed MIME types (JPEG/PNG/WebP), a type/extension match, non-empty and size
limit (5 MB), and a per-listing cap (12) — returning actionable messages (H1). A
bad file is skipped with a message and never disturbs the rest of the draft (H2).

### D-029 - Media moderation gates publication; min 3 images to submit

Status: Confirmed (Milestone 3)
Decision: Uploaded images start `pending`; only `approved` media is included by
the public projection (B3), and only the managing lister/admin may attach, remove,
or reorder them (H3). A listing now needs at least three images to be submitted
(OQ-004), surfaced in the editor's readiness checklist and enforced in the service.
Real approved images render via a plain lazy `<img>` from `/api/media`; seed data
keeps the placeholder tile. Video remains a provider-abstraction stub (no autoplay).

## Milestone 4 build decisions

Decided while implementing Milestone 4 (availability, views, inquiries, inspections).

### D-030 - Qualified views: pure rule + store-level dedup + random visitor id

Status: Confirmed (Milestone 4)
Decision: `domain/views.ts` decides eligibility (engagement threshold, exclude
owner/staff/bot — F2/F4); the store dedups the same visitor within the window (F3).
A client `ViewTracker` beacon posts only after the engagement threshold, so a bare
page load is never counted. Deduplication uses a random opaque visitor cookie
(`joshomes_vid`), never device fingerprinting (docs §16.1).

### D-031 - Inquiries only on explicit action; aggregates only in public

Status: Confirmed (Milestone 4)
Decision: Call/WhatsApp clicks and inspection submissions record an inquiry; a page
load never does (F1). The public page shows aggregate `views7d`/`inquiries7d` counts
only — never who viewed or contacted a listing (F6). View/inquiry/inspection
endpoints are rate-limited by visitor (F7).

### D-032 - Availability actions go through the authoring service

Status: Confirmed (Milestone 4)
Decision: Reconfirmation (resets the freshness clock, clears overdue — E1) and
availability changes (mark available/paused/taken — E4) are authoring-service
operations gated by a new `change_availability` authorization action (owner or
admin — E2), each recording status history + audit. Freshness classification and
stale-search suppression already existed from Milestone 0.

### D-033 - Inspection requests: consent required, assigned-lister-only

Status: Confirmed (Milestone 4); engagement backend in-memory (D-025)
Decision: An inspection request requires name, phone, and explicit consent (G1),
collects only what is needed, and is visible only to the assigned lister's inbox
(G2); only that lister (or an admin) may change its status (G3). Views/inquiries/
inspections run on the in-memory engagement store; the pure qualification,
validation, and authorization logic carries to the DB tables when Supabase is wired.

## Milestone 5 build decisions

Decided while implementing Milestone 5 (reports, verification, operational admin).

### D-034 - Reports never auto-act; reporter stays anonymous

Status: Confirmed (Milestone 5)
Decision: Creating a report only records it — it never changes the listing (E5).
Any enforcement (place under review, suspend listing, warn/suspend lister) is a
deliberate staff resolution. Reports are staff-only; the reporter is identified
only by an anonymous visitor id that is never shown to the reported lister (I1).

### D-035 - Verification is admin-issued; badges derived only from valid records

Status: Confirmed (Milestone 5)
Decision: Only an administrator can issue or revoke a verification, so paying for
a service can never set a positive badge (I4). Public badges are derived solely
from active, non-revoked, non-expired records (I2/I3), and the public helper
returns only badge types — evidence pointers/summaries are admin-only and never
projected (H4/J3). Authored-lister badges are injected into the public projection
from the verification store.

### D-036 - Unified searchable audit log + admin analytics

Status: Confirmed (Milestone 5)
Decision: Sensitive actions (approvals, moderation, availability changes, reports,
verification, account status) append to one audit log with an admin-only search;
audit summaries carry ids/reasons only, never secrets or personal data (J1/J2).
Admin analytics report the headline "available now" plus taken/overdue/open-report
counts, and an availability (overdue) queue.

### D-037 - Account suspension via the auth provider

Status: Confirmed (Milestone 5); dev backend in-memory (D-021/D-025)
Decision: The `AuthProvider` gained `setAccountStatus`; the "suspend lister"
report resolution suspends the reported lister's account, which the existing
sign-in check already refuses. In-memory in dev; maps to a `profiles.account_status`
update under Supabase.

## Milestone 6 build decisions

Decided while implementing Milestone 6 (seeker accounts, saves, and alerts).

### D-038 - Saving needs an account; browsing never does

Status: Confirmed (Milestone 6)
Decision: Public browsing/search stays open to guests (D-003 unchanged). Saving a
home or a search requires signing in — the Save action returns a sign-in prompt
for guests. All seeker data (favorites, saved searches, preferences) is keyed by
profile id and read only for the current user, so one seeker can never see or
change another's data.

### D-039 - Notification abstraction with categories; marketing is opt-in

Status: Confirmed (Milestone 6)
Decision: `notify()` fans out to channels (an in-app inbox now; a development
"email" log; a real provider at Milestone 7) and gates delivery by category:
`operational` and `alert` messages are always delivered, `marketing` only with an
explicit opt-in — keeping promotional messages distinct from operational ones.

### D-040 - Saved-search alerts fire on approval

Status: Confirmed (Milestone 6)
Decision: When a moderator approves a listing, the action matches it against every
enabled saved search (using the same filter logic as public search) and sends an
`alert` notification to those seekers. An inspection request also notifies the
assigned lister (operational). In-memory now; maps to the notifications table +
a delivery job under Supabase.

## Milestone 7 build decisions

Decided while implementing Milestone 7 (pilot hardening and deployment).

### D-041 - Indexing, canonical URL, and metadata are env-driven

Status: Confirmed (Milestone 7)
Decision: `NEXT_PUBLIC_SITE_URL` drives `metadataBase`, `robots.ts`, and
`sitemap.ts`. Indexing is OFF unless `JOSHOMES_ALLOW_INDEXING=true`, so
staging/prototype deploys never appear in search. The sitemap lists only public
slugs of searchable listings — never a private address, and never taken/unpublished
listings (docs §24).

### D-042 - Observability + controlled error output

Status: Confirmed (Milestone 7)
Decision: Structured JSON logging with a `captureError` seam
(`src/lib/observability/logger.ts`) where a monitoring provider is wired at
deploy time. The app error boundary reports through the seam and shows only a safe
message — never a stack trace, SQL, or storage path (L5). A `/api/health` probe
reports the active data/auth backend without leaking secrets.

### D-043 - Self-service data deletion

Status: Confirmed (Milestone 7)
Decision: A signed-in user can delete their saved homes, searches, preferences,
and notifications (Preferences → Delete my data); the action is audited. Full
retention periods and the account-deletion/anonymization process are documented in
docs/OPERATIONS.md and require legal review before launch (OQ-013).

### D-044 - Deploy + live-RLS remain an operator step (D-022 carried)

Status: Open follow-up (Milestone 7)
Decision: The app is deployment-ready (Vercel/Netlify) and fully documented in
docs/DEPLOYMENT.md, but provisioning Supabase, applying the migrations/seed, and
verifying RLS against a live database could not be done from the build environment.
This is the one remaining pre-pilot task; everything else runs on in-memory dev
backends by design.

## Design pass decisions

### D-045 - Labelled stock photos as sample listing media

Status: Confirmed (product owner, 2026-10-28)
Decision: While no lister has uploaded photos, the fictional seed listings use
freely licensed stock photos from Unsplash and Pexels (Unsplash License, Pexels
License), stored in public/sample-photos. Every one is shown with a visible
"Sample photo" label, its alt text says "(sample photo)", and lists and galleries
state that they are stock images, not the actual property. Uploaded photos always
take precedence, and listings without either show a layout sketch.
Reason: Realistic listing pages during the building phase without using images
we have no right to. Pinterest images were considered and rejected: pinning grants
no reuse rights and the original owners usually cannot be traced.
Consequences: Sample photos exist only in seed data (`sampleSrc`); they are never
attached to lister records. Remove them, or keep them clearly labelled, before the
public pilot. Credits and sources are in docs/SAMPLE_PHOTOS.md.
Documents or code affected: src/lib/data/seed.ts, src/lib/domain/projection.ts,
src/components/listing/MediaImage.tsx, Gallery.tsx, ListingGrid.tsx.

## Decisions to make before Milestone 2

### OQ-001 - Initial target segment

Options:

- Self-contained, one-bedroom, and two-bedroom homes for students and young workers.
- Family apartments.
- All residential rentals from launch.

Recommended default: Start with self-contained through two-bedroom rentals in a limited set of areas that can be manually verified.

### OQ-002 - Initial coverage areas

Question: Which neighbourhoods should appear in the pilot and which can the operating team physically support?

Decision criteria:

- Existing landlord or agent relationships.
- Demand.
- Ease of verification.
- Safety and travel cost.
- Diversity of price bands.

### OQ-003 - Lister onboarding model

Options:

- Open self-service submission with moderation.
- Invite-only pilot.
- Concierge onboarding by the operating team.

Recommended default: Invite or manually onboard the first listers, while keeping the software capable of self-service later.

### OQ-004 - Minimum image count

Recommended default: Three images for publication, with an admin exception for special cases.

### OQ-005 - Video provider

Question: Use the primary storage provider, a dedicated media provider, or postpone user video uploads during the earliest pilot?

Recommended default: Design the interface and data model now; use a provider abstraction and enable production video only after bandwidth and moderation costs are understood.

### OQ-006 - Authentication method

Options:

- Email magic link or password for the prototype.
- Phone OTP for listers.
- Phone plus email fallback.

Recommended default: Keep the auth implementation provider-compatible. For a controlled prototype, email-based login may be simpler; require a separately verified contact phone before publication.

### OQ-007 - Public phone display

Options:

- Display approved number directly.
- Reveal after a deliberate click.
- Route through masked calling later.

Recommended default: Reveal or redirect only after a controlled action so the click can be rate-limited and counted as an inquiry.

### OQ-008 - Freshness windows

Proposed testing values:

- Fresh within 72 hours.
- Recent within 7 days.
- Confirmation overdue after 7 days.
- Suppress after 14 days.

Decision: Validate with real lister behavior during the pilot and keep configurable.

### OQ-009 - Contact channel priority

Question: Should WhatsApp, phone, or inspection request be the primary button?

Recommended default: WhatsApp as primary only if listers reliably use it; otherwise use a neutral `Contact lister` group with call and WhatsApp equally visible.

### OQ-010 - Map behavior

Options:

- No map in the earliest version.
- Approximate map circle.
- Area centroid with landmark text.

Recommended default: Area and landmark first. Add approximate map after confirming provider cost, privacy, and performance.

## Decisions to make before public pilot

### OQ-011 - Verification operations

Define:

- Which checks are offered.
- Required evidence.
- Who can review it.
- Expiry and revocation rules.
- Whether any check is paid.
- Public wording for each result.

### OQ-012 - Report and appeal policy

Define report reasons, priority, response workflow, what is shared with a lister, suspension thresholds, and an internal appeal-note process.

### OQ-013 - Data retention

Define retention periods for:

- Rejected media.
- Verification evidence.
- Detailed view events.
- Inquiry contact details.
- Reports.
- Audit logs.
- Closed accounts.

Obtain professional review before launch.

### OQ-014 - Revenue experiment

Choose the first paid offering:

- Featured listing.
- Professional media package.
- Property-access verification visit.
- Agent subscription.

Recommended default: Begin with professional media or clearly labelled promotion after the free supply base is healthy.

### OQ-015 - Brand name

`JosHomes` is a working name. Complete a domain, company-name, and trademark review before investing heavily in branding.

## Decision record template

### D-XXX - Decision title

Status: Proposed / Confirmed / Reversed  
Owner:  
Date:  
Decision:  
Reason:  
Alternatives considered:  
Consequences:  
Documents or code affected:
