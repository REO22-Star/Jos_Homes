# AGENTS.md - JosHomes engineering contract

## Mission

Build a trustworthy, mobile-first marketplace where people in Jos can discover genuinely available long-term residential rentals, view useful photos and short videos, understand the complete expected cost, and contact an accountable lister.

The product wins on freshness, transparency, local relevance, and trust. It does not win by having the largest historical listing count.

## Required reading

Before any implementation, read all files in `docs/`. Do not infer requirements from the project name or invent major product behavior that is not documented.

## Fixed MVP decisions

- Working product name: JosHomes.
- Geography: Jos and nearby communities in Plateau State.
- Initial category: long-term residential rentals.
- Primary client: responsive web application that can later become installable as a PWA.
- Public browsing does not require an account.
- Listers require an account to create or manage listings.
- The system distinguishes property records from vacancy listing records.
- A listing must show when its availability was last confirmed.
- Public location is approximate; exact address is private.
- View counts and inquiry counts are different metrics.
- The public sees aggregate counts, not the identities of interested users.
- Payment collection, escrow, rent loans, sales, land, short-lets, and native apps are outside the MVP.
- All in-house or sponsored listings must be visibly labelled.

## Recommended implementation stack

Use these choices unless the product owner explicitly changes them:

- Next.js with TypeScript.
- Mobile-first responsive UI.
- PostgreSQL database.
- Supabase for database, authentication, storage, and row-level security where practical.
- Server-side validation with Zod or an equivalent schema validator.
- Accessible form components and semantic HTML.
- Automated unit/component tests plus browser-level tests for critical flows.
- Environment variables for all secrets and external service configuration.

Do not pin a dependency version in documentation unless the project lockfile already establishes it. Use a stable compatible version at implementation time.

## Engineering behavior

- Work one milestone at a time.
- Before coding, restate the task and acceptance criteria.
- Prefer the simplest design that can safely support the MVP.
- Keep business rules in named modules, not scattered through UI components.
- Use database migrations. Never rely on undocumented manual database changes.
- Validate and authorize every write on the server.
- Treat browser input, uploaded media, query strings, and webhook data as untrusted.
- Add loading, empty, success, and error states for user-visible workflows.
- Make the app usable at narrow mobile widths before optimizing desktop layouts.
- Avoid autoplay video and unnecessary media downloads.
- Never expose private addresses, verification documents, private notes, or unrestricted phone data through public APIs.
- Use fictional seed data and clearly fake contact details.
- Do not use real property photos without permission.
- Never commit secrets, access tokens, or production credentials.
- Do not report tests as passing unless commands were run and completed successfully.

## Required quality gates

A milestone is not complete until the relevant checks pass:

- Formatting or linting.
- Type checking.
- Automated tests for new business logic.
- Production build.
- Manual mobile-width review of the main path.
- Authorization review for every new data mutation.
- Acceptance criteria from `docs/ACCEPTANCE_TESTS.md`.

If a check cannot run, state the exact reason and leave a visible follow-up item.

## Security and privacy defaults

- Public pages use a safe public projection of listing data.
- Exact addresses and verification files are private.
- Uploaded files must have type, size, ownership, and moderation checks.
- Use rate limiting for login, inquiry, report, view-tracking, and upload endpoints.
- Use a random anonymous browser identifier rather than invasive fingerprinting.
- Deduplicate qualified views before displaying counts.
- Record significant moderation and status actions in an audit log.
- Limit admin access by role and least privilege.
- Do not collect highly sensitive identity data merely because it might be useful later.
- Obtain professional legal and compliance review before public launch.

## Product language rules

- Do not call every page visit an interested person.
- Use `views` for qualified, deduplicated property-page visits.
- Use `inquiries` for explicit actions such as call, WhatsApp, inspection request, or an interest form.
- Do not call access verification ownership verification.
- Do not imply that a badge guarantees the honesty, ownership, or safety of a lister.
- Avoid false urgency and fabricated live activity.
- Show prices and fees in plain language.

## Definition of done for a feature

A feature is done only when:

- The happy path works.
- Common failure states are handled.
- Authorization is enforced.
- Relevant events are logged.
- Mobile and keyboard use are acceptable.
- Automated tests cover the important rules.
- The product documents are updated when behavior changes.
- No later-milestone feature was accidentally introduced.

## Changes that require product-owner approval

- Adding in-platform payments.
- Publishing exact addresses.
- Publicly exposing seeker identities.
- Ranking in-house listings above others without a sponsored label.
- Expanding beyond long-term residential rentals.
- Changing the meaning of availability, verification, views, or inquiries.
- Replacing the agreed stack after implementation has started.
- Adding a native mobile application before the web MVP has been validated.
