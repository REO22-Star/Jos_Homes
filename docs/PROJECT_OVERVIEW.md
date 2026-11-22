# JosHomes — Project Overview (Draft)

_Last updated: 2026-07-23. Working title; not a legal or investment document._

## 1. In one line

**JosHomes is a mobile-first, trust-forward marketplace for genuinely available
long-term residential rentals in Jos, Plateau State, Nigeria** — built so a home
seeker can find current listings, understand the full cost up front, and contact
an accountable lister, without wasting money on stale or misleading adverts.

## 2. The problem

Finding a home to rent in Jos today means piecing together informal referrals,
social-media posts, roadside signs, and fragmented listing sites. The recurring
failures are predictable and costly:

- A property is already taken but still advertised.
- The listed price hides agency, legal, caution, or service fees.
- Photos are old, incomplete, or copied from elsewhere.
- The public address is vague, so seekers travel to the wrong place.
- The identity or authority of the person listing is unclear.
- Landlords and credible agents have no simple, trusted way to show current
  inventory and manage inquiries.

The result is wasted time, wasted transport money, and a market where trust is
scarce.

## 3. The idea

JosHomes competes on **freshness, cost transparency, local relevance, and trust**
— not on having the largest historical database. A smaller set of listings that
are _actually available right now_, with _clear costs_ and a _known contact_, is
more valuable than thousands of stale ones.

Three product commitments run through everything:

1. **Freshness is a feature.** Every listing shows when its availability was last
   confirmed; stale listings are suppressed from ordinary search until reconfirmed.
2. **Honesty about cost and identity.** Rent and each fee are shown in plain
   language with an estimated move-in total; verification badges state exactly
   what was checked and never imply a guarantee.
3. **Privacy by construction.** Exact addresses, verification evidence, raw phone
   numbers, and reporter identities are never exposed on public pages — enforced
   in the data layer, not by UI discipline.

The first release is a **discovery, verification, and communication** product. It
does **not** collect rent, deposits, or agency fees; payments, escrow, sales,
land, short-lets, native apps, and nationwide coverage are explicitly out of scope
for now.

## 4. Who it's for

- **Home seekers (guests):** browse, search, filter, view listings, and contact
  listers — no account required. Optional accounts add saved homes, saved
  searches, and alerts.
- **Landlords, agents, and caretakers (listers):** publish and manage vacancies,
  upload media, reconfirm availability, and handle inspection requests.
- **Moderators:** review submitted listings and media, triage reports, and keep
  inventory current and honest.
- **Administrators:** manage verification, suspend bad actors, read the audit log,
  and see operational analytics.

## 5. What it does (by area)

**Discovery (public, no account)**

- Home page with a live "fresh, available vacancies today" count and area shortcuts.
- Search with shareable URL filters (area, price, property type, bedrooms,
  furnished, direct-landlord), a product-relevance order, and clearly-labelled
  sponsored results.
- Property detail: image gallery (no autoplay), a full fee breakdown with an
  **estimated move-in total**, freshness, approximate location (never the exact
  address), a lister summary with precise verification badges, and aggregate
  view/inquiry counts.

**Contact & inspection**

- Controlled **Call / WhatsApp** actions that record an explicit inquiry (a page
  load is never counted as an inquiry) and reveal contact only after a deliberate
  click.
- An **inspection request** form that requires consent and lands in the lister's
  inbox; only the assigned lister can see the requester's details.

**Lister tools**

- A structured **listing editor** with draft save/resume, property↔listing
  separation, fee fields, and private-vs-public address handling.
- **Photo management** (upload, remove, set cover) with server-side validation;
  at least three images are required to submit.
- **Submit for review**, see moderation feedback, and — once approved —
  **reconfirm availability** or mark the listing available / paused / taken.

**Moderation & trust**

- A **review queue** to approve, request changes, reject, or suspend listings, and
  to approve or reject each photo (only approved media is ever public).
- A **reports** queue: a report never changes a listing on its own; a moderator
  deliberately dismisses it, places the listing under review, warns, or suspends
  the lister. The reporter stays anonymous to the lister.

**Administration**

- **Verification records**: issue/revoke precise badges (admin-only; a paid
  service can never auto-grant a badge; evidence is restricted).
- **Analytics** (available now, taken, overdue, open reports), an **availability
  queue** of overdue listings, and a **searchable audit log**.

**Seeker accounts**

- **Saved homes**, **saved searches** with alerts, an in-app **notifications**
  inbox, and **contact preferences** where marketing is opt-in and operational
  messages are always sent. Self-service **data deletion** is included.

## 6. Product principles / differentiators

- **A property and a vacancy are different records.** One physical property can
  have many listing periods over time, each with its own moderation history.
- **Views ≠ inquiries.** Views are deduplicated, engagement-qualified page visits;
  inquiries are explicit actions. The public sees aggregate counts only — never
  who viewed or contacted a listing.
- **Freshness thresholds are configurable**, not hard-coded, so the operating team
  can tune them during the pilot.
- **Sponsored and in-house listings are always labelled** and never get hidden
  ranking priority.
- **No false urgency** — no fabricated "X people are viewing" claims.

## 7. How it's built

- **Stack:** Next.js 15 (App Router) + TypeScript, React 19 server components and
  server actions, CSS Modules with a design-token system (no CSS framework), and
  one self-hosted font, Public Sans, with only its basic Latin file preloaded
  (D-046) — deliberately lean for low-bandwidth mobile connections. Zod for
  server-side validation. Vitest + Testing Library for unit/component tests,
  Playwright for browser tests.
- **Provider-abstracted backends.** Both the listing data layer and authentication
  sit behind interfaces. With no configuration the app runs on deterministic
  in-repo fictional data and in-memory development accounts — fully runnable and
  testable with zero external services. Setting Supabase environment variables
  switches the data and auth backends to a real Postgres project, with no code
  changes. Both backends return the same safe public projection, so swapping them
  cannot change what is or isn't public.
- **Two-layer authorization.** A single application-layer rule table
  (`can`/`assertCan`) governs every write; the database's row-level-security
  policies mirror the same rules as a backstop. A stateless, HMAC-signed session
  cookie carries only a profile id — the role is re-resolved on every request, so
  a role change or suspension takes effect immediately.
- **Security posture:** private data never enters a public payload (enforced by an
  explicit projection / DB view); server-side validation and authorization on
  every write; rate limiting on sensitive endpoints; security headers (incl. HSTS
  in production); controlled error output (no stack traces to users); indexing is
  opt-in so staging never leaks into search; a `/api/health` probe and structured
  logging with a monitoring seam.

## 8. Data model (core)

Physical **properties** (with a private address) are separate from **listings**
(one advertised vacancy period). Around them sit **media** (with moderation
state), **status history** (append-only), **verification records**, **reports**,
**inquiries / inspection requests**, **saved listings / searches**,
**notifications**, and an **audit log**. Money is stored as integer minor units
(kobo); timestamps are timezone-aware; significant changes are append-only. The
`public_listings` projection/view exposes only safe fields and only
workflow-approved listings.

## 9. Trust, privacy & safety by design

- Exact street addresses, verification evidence, internal notes, and raw phone
  numbers are never returned to public pages, metadata, the sitemap, or logs.
- Verification badges describe the specific check performed (e.g. "Property access
  verified", not "Ownership verified") and disappear when revoked or expired.
- Reporter identities are anonymous and never shown to the reported lister.
- View measurement uses a random anonymous cookie for deduplication, not device
  fingerprinting, and stores only what's needed for aggregates and abuse control.
- Sensitive actions are audited; audit summaries carry no secrets.

## 10. Build status

Delivered in eight milestones (M0–M7), each shipped only after passing formatting,
type-checking, linting, unit tests, a production build, and browser tests:

- **M0** Foundation + clickable public prototype.
- **M1** Database schema, authentication, roles, RLS, safe public query.
- **M2** Lister submission + moderation workflow.
- **M3** Media upload, moderation, and delivery.
- **M4** Availability/freshness, qualified views, inquiries, inspection requests.
- **M5** Reports, verification, and operational admin.
- **M6** Seeker accounts, saves, searches, alerts, and notifications.
- **M7** Pilot hardening: deploy config, observability, data deletion,
  accessibility/mobile review, SEO controls, and documentation.

**Quality today:** ~154 unit/component tests and ~68 browser tests (mobile +
desktop), all green; clean type-check, lint, and production build.

## 11. The one outstanding item before a real pilot

Everything currently runs on the in-memory development backends. Two things remain
to go from "feature-complete prototype" to "live pilot":

1. **Provision Supabase** and verify row-level security against the live database
   (schema, seed, and storage buckets are written; the migrations just need to be
   applied and the RLS checks run). This is the documented **D-022** follow-up.
2. **Implement the Supabase-backed write services.** Reads and authentication are
   already wired to Supabase; the write paths for submission, moderation, media,
   engagement, reports, verification, and seeker features were built against the
   in-memory backend and need their Supabase implementations behind the same
   interfaces so data persists in production (serverless can't rely on in-memory
   state). This is the main remaining engineering effort.

The app is otherwise deployment-ready (Vercel/Netlify); public browsing works on a
deploy today, and the full lifecycle becomes persistent once the two items above
are done.

## 12. Business boundaries & where revenue could come from later

The MVP never charges a seeker to see basic details or contact a lister. After the
free supply base is healthy, likely paid offerings include clearly-labelled
featured listings, professional lister subscriptions, a photography/walkthrough
service, and a property-access verification visit — always kept distinct from
honest, unpaid ranking. Payments, escrow, sales/land/commercial, and a native app
are deferred until the discovery-and-trust product is validated.

## 13. What success looks like

The headline metric is **"fresh, available vacancies in Jos today"** rather than
total historical listings — plus healthy detail-to-inquiry conversion, prompt
"marked taken" behaviour from listers, and seekers returning for alerts. Before a
public launch, the team should complete qualified local legal/compliance review of
privacy, terms, advertising/agency disclosures, and verification wording.
