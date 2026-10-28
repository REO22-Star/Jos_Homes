# Acceptance Tests

## How to use this document

These are product-level checks. Implement them as automated tests where practical and supplement them with manual review. A milestone is incomplete when its relevant critical tests fail.

Priority labels:

- P0: Blocks pilot or creates a serious privacy/security failure.
- P1: Core MVP behavior.
- P2: Important quality or usability behavior.

## A. Public discovery

### A1 - Guest can browse without registration - P1

Given a visitor is not signed in, when the visitor opens the home page, searches by area and budget, and opens a result, then the visitor can view the approved public listing page without being forced to create an account.

### A2 - Filters survive sharing - P2

Given a visitor applies area, price, property type, and bedroom filters, when the result URL is copied into a new session, then the same supported filters are restored.

### A3 - Unavailable records are excluded - P0

Given listings exist in draft, rejected, suspended, paused, taken, and stale-suppressed states, when a guest performs an ordinary available search, then none of those records appear.

### A4 - Sponsored listing is labelled - P1

Given a listing has paid placement, when it appears in results, then the card visibly says sponsored or featured and does not masquerade as an organic ranking.

### A5 - Private address is absent - P0

Given a property has a complete private address, when any public page, public API response, page metadata, structured data, log intended for the browser, or shared preview is inspected, then the private address is absent.

## B. Property detail

### B1 - Core information is understandable - P1

The page shows area, property type, rent frequency, additional charges, estimated move-in total, availability, last confirmation, lister type, and main contact actions.

### B2 - Media is data-conscious - P1

The page does not autoplay video, images use responsive sizes or safe placeholders, and below-the-fold media is lazy loaded where appropriate.

### B3 - Only approved media is public - P0

Given a listing has pending or rejected media, when a guest loads the page, then only approved media URLs are returned.

### B4 - Taken page is useful - P2

Given a formerly published listing is taken, when a visitor follows its old public URL, then the page clearly states it is taken, disables misleading contact actions, and offers available alternatives rather than returning an unexplained broken page.

## C. Authentication and authorization

### C1 - Lister owns edits - P0

Given Lister A and Lister B exist, when Lister A attempts to edit Lister B's property, listing, media, or inquiries through the UI or direct request, then the server rejects the action.

### C2 - Lister cannot self-approve - P0

Given a lister submits a listing, when that lister attempts to set the workflow state to approved, then the server rejects the action and records no approval.

### C3 - Role escalation is blocked - P0

Given an ordinary account, when it changes client-side role data or submits an admin role in a request, then the server and database reject the escalation.

### C4 - Session errors are safe - P1

Given a session expires during a form submission, then the user receives an understandable sign-in or retry message and no unauthorized write occurs.

## D. Listing submission and moderation

### D1 - Draft can be resumed - P1

Given a lister saves a partially complete listing, when the lister returns later, then the saved fields are restored and missing requirements are identified.

### D2 - Required disclosures are enforced - P1

A listing cannot be submitted without rent, frequency, availability, public area, private address, property type, contact path, and an explicit additional-fee disclosure.

### D3 - Workflow transitions are controlled - P0

Attempts to skip from draft directly to approved, or from rejected directly to available without a valid review path, are rejected.

### D4 - Moderation history is retained - P1

When a moderator requests changes and later approves the corrected listing, the original submission, feedback, resubmission, actor, and timestamps remain traceable.

## E. Availability

### E1 - Reconfirmation updates freshness - P1

Given an approved available listing is due for confirmation, when its authorized lister reconfirms, then `last_confirmed_at`, the next due time, and history are updated atomically.

### E2 - Unauthorized confirmation fails - P0

A user who does not own or manage the listing cannot reconfirm its availability.

### E3 - Stale suppression works - P1

Given a listing exceeds the configured suppression threshold, when ordinary search runs, then the listing is excluded until reconfirmed or reviewed.

### E4 - Taken action is immediate - P1

When an authorized lister marks a property taken, it no longer appears in ordinary available search and the public page changes to the taken experience.

### E5 - Report does not auto-delete - P1

When one user reports a property as taken, the platform records the report and begins the configured workflow; it does not automatically delete the listing solely on the unverified report.

## F. Views and inquiries

### F1 - Initial page load is not an inquiry - P0

Opening a property page must not create a call, WhatsApp, inspection, or interest inquiry.

### F2 - Engagement threshold - P1

A page visit that closes before the configured qualified-view threshold does not increment the qualified-view count.

### F3 - View deduplication - P1

Repeated qualified visits from the same authenticated or anonymous visitor within the dedupe window increment at most once.

### F4 - Owner and staff exclusion - P1

Visits from the listing owner, authorized administrators, automated browser tests, and known bots are excluded from public metrics where practical.

### F5 - Contact action creates correct inquiry - P1

When a guest uses a controlled call or WhatsApp action, the correct inquiry type is recorded once and the user is redirected to the approved destination.

### F6 - Public identity remains private - P0

Public pages show aggregate counts only and never return the identities, phone numbers, or messages of interested users.

### F7 - Rate limit works - P0

Rapid automated contact clicks, reports, or inspection requests beyond the configured threshold are rejected or challenged without corrupting aggregate counts.

## G. Inspection requests

### G1 - Consent and required fields - P1

A request cannot be submitted without the required contact data and consent to share it with the assigned lister.

### G2 - Assigned lister access only - P0

Only the assigned lister and authorized staff can view requester contact details.

### G3 - Status ownership - P1

An assigned lister can update the request status; an unrelated lister cannot.

## H. Media

### H1 - File validation - P0

Unsupported extensions, mismatched MIME types, excessive sizes, or unauthorized upload targets are rejected server-side.

### H2 - Failed upload is recoverable - P1

When one media upload fails, the user can retry or remove it and the rest of the listing draft remains intact.

### H3 - Cross-account media access is blocked - P0

Lister A cannot attach, reorder, delete, or publish Lister B's media.

### H4 - Evidence is private - P0

Verification evidence cannot be fetched through a public listing-media URL or guessed public path.

## I. Reports and verification

### I1 - Reporter privacy - P0

The reported lister cannot see the reporter's identity unless a deliberate, lawful process authorizes disclosure.

### I2 - Precise badge wording - P1

A property-access verification record produces `Property access verified`, not `Ownership verified`.

### I3 - Expired or revoked badge disappears - P1

When a verification expires or is revoked, public output no longer displays it.

### I4 - Payment cannot force approval - P0

A paid verification-service record cannot set its own positive verification status without the required review action.

## J. Admin and audit

### J1 - Sensitive actions are logged - P1

Approvals, rejections, suspensions, role changes, badge issuance, badge revocation, and material listing edits create audit entries.

### J2 - Audit log omits secrets - P0

Audit entries do not copy passwords, raw tokens, or complete identity-document contents.

### J3 - Moderator limitation - P0

A moderator who lacks identity-evidence permission cannot access protected evidence even though the moderator can review ordinary listing content.

## K. Accessibility and mobile quality

### K1 - Keyboard path - P1

A keyboard user can search, open filters, open a listing, use the gallery controls, and reach contact actions without becoming trapped.

### K2 - Labels and errors - P1

Every form control has a programmatic label and validation errors identify the affected field and corrective action.

### K3 - Narrow-screen usability - P1

At a representative narrow mobile width, primary text is readable without horizontal scrolling, buttons remain tappable, and the fee breakdown does not overflow.

### K4 - Status not color-only - P2

Availability, verification, errors, and warnings include text or icons with accessible labels rather than depending on color alone.

## L. Reliability and release

### L1 - Fresh environment setup - P1

A developer can follow the documented steps to install dependencies, configure a local environment, run migrations, seed fictional data, and start the app.

### L2 - Repeatable migrations - P0

The database can be built from migrations in a clean environment without undocumented manual steps.

### L3 - Production build - P0

The project completes a production build without type errors.

### L4 - No secrets in repository - P0

Repository history and committed files contain no live credentials or private production data.

### L5 - Controlled error output - P1

User-facing failures do not expose stack traces, raw SQL, storage paths, or secret configuration.
