# Implementation Plan

## Delivery principle

Build a functioning vertical slice in controlled milestones. Each milestone must leave the repository runnable and reviewable. Commit or checkpoint after a milestone passes its quality gates.

## Milestone 0 - Foundation and clickable prototype

### Goal

Create the project foundation, visual language, navigation, representative public pages, and deterministic fictional data without requiring a live production backend.

### Deliverables

- Next.js TypeScript project initialized.
- Formatting, linting, type checking, test runner, and production build configured.
- Environment example file with no secrets.
- Shared layout, typography, spacing, buttons, inputs, cards, badges, dialog, alert, skeleton, and empty-state components.
- Mobile navigation and desktop navigation.
- Home page.
- Search-results page driven by fictional data and URL parameters.
- Property-detail page with fictional image placeholders, fee breakdown, freshness, lister summary, metrics, and contact actions that do not contact a real person.
- Safety, privacy-placeholder, terms-placeholder, and contact pages.
- Not-found and error states.
- Responsive behavior at narrow mobile, tablet, and desktop widths.
- Basic component and browser tests for public navigation.
- `docs/DECISIONS_AND_OPEN_QUESTIONS.md` updated for any new assumptions.

### Acceptance emphasis

- No exact address in public sample data.
- No real phone numbers or real people.
- Annual rent and fees are understandable.
- No autoplay video.
- Main public pages work without authentication.
- The project builds successfully.

## Milestone 1 - Database, authentication, and roles

### Goal

Create the real data foundation and secure account model without yet exposing a complete listing-submission workflow.

### Deliverables

- Supabase project integration through environment variables.
- Database migrations for profiles, lister profiles, areas, properties, listings, status history, and audit logs.
- Reproducible seed script using fictional data.
- Authentication screens and session handling.
- Role model for seeker, lister, moderator, and administrator.
- Protected dashboard shell.
- Row-level security or equivalent policies.
- Explicit safe public listing query or view.
- Authorization tests.
- Development setup instructions.

### Acceptance emphasis

- A public query cannot return a private address.
- A lister cannot modify another lister's records.
- Moderator and administrator permissions are distinct.
- Seed and migration commands are repeatable.

## Milestone 2 - Lister submission and moderation

### Goal

Allow listers to create a complete draft, submit it, receive changes, and publish only after moderation.

### Deliverables

- Multi-step or well-structured listing form.
- Draft save and resume.
- Property and listing separation.
- Fee fields and estimated move-in total.
- Public area and private address handling.
- Submission validation.
- Review queue.
- Approve, request changes, reject, and suspend actions.
- Structured moderation reasons.
- Status-history and audit-log records.
- Public search backed by approved database records.
- Tests for workflow transitions and authorization.

### Acceptance emphasis

- A lister cannot self-approve.
- Unapproved listings do not appear publicly.
- Private fields remain private in all public payloads.
- Invalid status transitions are rejected.

## Milestone 3 - Media and listing quality

### Goal

Support safe, resilient property images and optional short walkthrough video.

### Deliverables

- Image upload with server-side validation.
- Ordered gallery and cover image.
- Upload progress, retry, removal, and draft recovery.
- Pending and approved media states.
- Responsive image delivery and thumbnails.
- Optional video upload or a provider abstraction with a local test path.
- Video poster and no autoplay.
- Media review controls.
- Separate storage policy for public listing media and private evidence.
- Tests for file ownership and publication state.

### Acceptance emphasis

- Unapproved media never appears publicly.
- A failed upload does not erase the listing draft.
- Unsupported or oversized files are rejected with useful messages.
- Verification evidence is not stored in a public media location.

## Milestone 4 - Availability, views, inquiries, and inspection requests

### Goal

Deliver the main marketplace differentiators: freshness, meaningful demand metrics, and controlled contact actions.

### Deliverables

- Configurable freshness rules.
- Availability reconfirmation action.
- Confirmation-due and overdue states.
- Automatic suppression of stale listings from ordinary search.
- Status-history entries.
- Anonymous browser ID and qualified-view endpoint.
- Engagement threshold and deduplication.
- Daily aggregate metrics.
- Controlled call and WhatsApp tracking endpoints.
- Inspection-request form and lister inbox.
- Rate limiting and abuse controls.
- Public recent views and inquiry counts.
- Tests for deduplication, exclusions, and status rules.

### Acceptance emphasis

- Page load alone is not immediately counted as an inquiry.
- Repeated visits within the dedupe window do not inflate qualified views.
- Listing owners and admins do not inflate public views.
- Taken and stale listings are absent from ordinary available search.
- Contact actions record an inquiry without exposing unrelated user data.

## Milestone 5 - Reports, verification, and operational admin

### Goal

Give the local operating team practical trust-and-safety tools.

### Deliverables

- User report form and reasons.
- Report triage and resolution workflow.
- Under-review status.
- Verification record model and precise public badge labels.
- Evidence access restrictions.
- Duplicate-listing review signals.
- User warning, suspension, and appeal-note capability.
- Availability queue.
- Searchable audit log.
- Admin analytics for active, fresh, taken, reported, and overdue listings.
- Tests for report privacy and verification permissions.

### Acceptance emphasis

- Reporter identity is not public or visible to ordinary listers.
- Badges state exactly what was checked.
- Paying for a service does not bypass approval.
- Sensitive evidence is available only to authorized roles.

## Milestone 6 - Seeker accounts, saves, and alerts

### Goal

Increase repeat use without making registration a browsing barrier.

### Deliverables

- Saved listings.
- Saved searches.
- Alert preferences.
- Inquiry history.
- Notification abstraction.
- In-app and email development path.
- Unsubscribe and preference controls.
- Tests for ownership and privacy.

### Acceptance emphasis

- Guests can still browse.
- A user cannot see another seeker's saves or inquiry history.
- Marketing preferences are distinct from operational messages.

## Milestone 7 - Pilot hardening and deployment

### Goal

Prepare for a controlled Jos pilot with human support and observability.

### Deliverables

- Production deployment configuration.
- Secure environment and secrets checklist.
- Error monitoring and structured logging.
- Basic uptime and performance checks.
- Database backup and recovery notes.
- Incident-response checklist.
- Content moderation and support playbook.
- Data-retention configuration and deletion workflow.
- Accessibility review.
- Mobile performance review.
- Search-engine indexing controls.
- Pilot analytics dashboard.
- Final end-to-end test run.

### Acceptance emphasis

- No production secrets in repository history.
- Private address and evidence-storage checks pass.
- Critical journeys pass on mobile widths.
- The team can hide a listing, suspend a lister, and investigate a report.
- Backups and incident contacts are documented.

## Deferred roadmap

After evidence of marketplace demand:

- Installable PWA refinements and push notifications.
- Professional agent plans and team accounts.
- Photography and property-access verification booking.
- Better map experience.
- Smarter duplicate-media analysis.
- Native mobile apps only when repeat usage and device needs justify them.
- Payments or escrow only after separate legal, operational, security, and dispute-resolution design.
