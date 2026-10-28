# Product Requirements Document

## 1. Document status

Working title: JosHomes  
Product stage: Ideation to MVP definition  
Primary market: Jos, Plateau State, Nigeria  
Primary platform: Mobile-first website  
Product owner: To be assigned  
Last updated: 17 July 2026

## 2. Product summary

JosHomes is a local housing-vacancy marketplace focused on current, trustworthy long-term residential rental listings in Jos. A home seeker can search by area, property type, price, and practical housing needs; see photos and short walkthrough videos; understand rent and additional charges; check how recently availability was confirmed; and contact the person responsible for the listing.

Landlords, agents, and caretakers can publish and manage vacancies. Administrators moderate listings, verify selected facts, investigate reports, and remove stale or misleading inventory.

The first release is not a rent-payment platform and not a nationwide property portal. Its central promise is that a smaller set of current, locally relevant listings is more useful than a large database of stale or unclear listings.

## 3. Product vision

Become the default place residents use to answer: `Which homes are genuinely available in Jos right now, what will they cost, and who can I safely contact?`

## 4. Problem statement

Home seekers often depend on informal referrals, social media posts, roadside signs, and fragmented listing sites. Common failures include:

- A property is already taken but still advertised.
- The listed price excludes important fees.
- Photos are old, incomplete, or copied.
- The public address is vague or misleading.
- The identity or authority of the lister is unclear.
- A seeker spends money and time visiting unsuitable properties.
- A landlord or credible agent has no simple way to show current inventory and manage inquiries.

## 5. Value proposition

For home seekers:

- Current availability information.
- Practical, locally relevant property details.
- Transparent cost breakdowns.
- Clear lister type and verification labels.
- Fast contact by phone, WhatsApp, or inspection request.
- A simple mobile experience that does not waste data.

For landlords and agents:

- A structured place to advertise vacancies.
- Better-qualified inquiries.
- A dashboard for managing status and media.
- Listing performance information.
- Optional verification and media services later.

For the platform:

- A defensible local supply network.
- Trust and freshness as differentiators.
- Revenue from optional promotion, professional accounts, and property-media services rather than hidden seeker charges.

## 6. Goals

### MVP goals

- Publish a useful catalogue of long-term residential vacancies in Jos.
- Let guests search and inspect listing details without registration.
- Let approved listers submit, edit, pause, reconfirm, and mark listings taken.
- Display useful images and optional short videos without excessive data usage.
- Separate qualified views from explicit inquiries.
- Establish a repeatable availability-confirmation workflow.
- Give administrators the tools to review listings and respond to reports.
- Build a stable foundation for later PWA and mobile-app work.

### Business validation goals

- Learn which Jos areas, price bands, and property types have the highest demand.
- Test whether listers will keep vacancy status current.
- Measure whether verification and better media increase inquiries.
- Identify services that agents or landlords will pay for.
- Establish whether seekers return for alerts and newly available homes.

## 7. Non-goals for the MVP

- Collecting rent, deposits, caution fees, agency fees, or inspection fees.
- Escrow, lending, instalment plans, or wallet balances.
- Property sales, land, commercial property, hotels, or short-lets.
- Tenant scoring or public reviews of tenants.
- Native Android or iOS applications.
- Nationwide coverage.
- Automated property valuation.
- Complex recommendation algorithms.
- Public exact addresses or exact map pins.
- Guaranteed ownership verification.
- A social-media feed.

## 8. User groups

### 8.1 Guest home seeker

Can browse, search, filter, open a property page, view aggregate metrics, contact a lister, report a listing, and read safety information. The guest may be asked for minimal information when requesting an inspection.

### 8.2 Registered home seeker

Can save listings, manage saved searches, receive alerts, view previous inquiries, and manage contact preferences. Registration is not required for ordinary browsing.

### 8.3 Landlord

Lists a property directly and manages its availability. A direct-landlord label is shown only after the relevant verification workflow is satisfied.

### 8.4 Agent or caretaker

Lists on behalf of an owner or manages access to a property. The public profile must clearly identify the lister type.

### 8.5 Moderator

Reviews submitted listings, media, reports, duplicates, and policy issues. A moderator does not automatically have access to all identity records.

### 8.6 Administrator

Manages users, roles, verification records, platform settings, audit logs, and escalated reports.

## 9. Core user journeys

### 9.1 Find a home

1. Open the home page.
2. Select an area or use a broad Jos search.
3. Choose budget, property type, and bedroom count.
4. Review result cards.
5. Open a listing.
6. Review media, cost breakdown, availability, features, and lister information.
7. Call, open WhatsApp, or request an inspection.
8. Save the property or report a problem.

### 9.2 Publish a vacancy

1. Create or access a lister account.
2. Complete the lister profile and phone verification state required by policy.
3. Add property details and private address.
4. Add the public area, landmark, and approximate location.
5. Enter rent and every required fee field.
6. Upload images and an optional short walkthrough video.
7. Preview the listing.
8. Submit for review.
9. Respond to moderation feedback if needed.
10. Publish after approval.
11. Reconfirm availability when prompted.
12. Mark the property taken, paused, or available as circumstances change.

### 9.3 Investigate a report

1. A user selects a report reason and adds optional details.
2. The platform records the report without exposing the reporter publicly.
3. A moderator reviews the listing history, media, lister, and previous reports.
4. The moderator may request evidence, hide the listing, warn the lister, or dismiss the report.
5. The action is recorded in an audit log.

## 10. Information architecture

### Public pages

- Home.
- Search results.
- Property detail.
- Lister public profile.
- List a property landing page.
- How it works.
- Safety guide.
- About.
- Contact and complaints.
- Terms.
- Privacy.
- Not found and error pages.

### Account pages

- Sign in and registration.
- Saved listings.
- Saved searches and alerts.
- Inquiry history.
- Account and contact preferences.

### Lister dashboard

- Overview.
- My listings.
- Add listing.
- Listing editor.
- Listing performance.
- Inquiries and inspection requests.
- Verification status.
- Public profile.
- Account settings.

### Admin area

- Review queue.
- Listings.
- Users and lister profiles.
- Reports.
- Verification records.
- Duplicate review.
- Availability queue.
- Audit log.
- Platform configuration.
- Basic analytics.

## 11. Public search requirements

### 11.1 Search inputs

The MVP should support:

- Area or neighbourhood.
- Property type.
- Minimum and maximum rent.
- Rent frequency, with annual as the primary rental pattern.
- Bedrooms.
- Bathrooms or toilets where available.
- Furnished state.
- Availability date.
- Direct landlord only.
- Selected verification filters.

### 11.2 Search behavior

- Search must work without an account.
- Filters must be reflected in the URL so a result set can be shared.
- The back button must preserve useful state.
- Mobile filter controls must be easy to open, apply, and clear.
- Results should default to a product-approved relevance order, not simply highest price.
- Sponsored results must be labelled and must not hide the existence of organic results.
- Taken, paused, expired, rejected, and draft listings must not appear in ordinary available searches.
- `Application pending` may appear only when the product owner deliberately enables it and the status is clearly shown.

### 11.3 Result card

Each card should show:

- Cover image or safe placeholder.
- Listing title.
- Area, not private address.
- Rent amount and frequency.
- Property type and bedroom count.
- Availability status.
- Last-confirmed freshness label.
- Lister type or meaningful verification label.
- A small aggregate metric such as recent views, when available.
- Sponsored label when applicable.

## 12. Property-detail requirements

The detail page should provide:

- Image gallery with accessible alternative text.
- Optional short walkthrough video with no autoplay.
- Listing title and reference ID.
- Public area and nearby landmark.
- Approximate map or location description.
- Rent and rent frequency.
- Separate agency, legal, caution, service, or other charge fields where applicable.
- A calculated `estimated move-in total` clearly labelled as an estimate.
- Bedrooms, bathrooms, toilets, and parking.
- Furnishing state.
- Water source and reliability notes.
- Electricity and meter information.
- Security and compound information.
- Restrictions or house rules.
- Earliest move-in date.
- Availability status and last-confirmed timestamp.
- Lister profile summary and precise badge labels.
- Aggregate views and inquiries in a defined recent period.
- Call, WhatsApp, request inspection, save, share, and report actions.
- Similar available properties after the main content.

The exact street address, private notes, verification documents, and internal moderation information must never be returned in the public listing payload.

## 13. Listing fields

### Required for submission

- Lister identity.
- Private property address.
- Public area.
- Property type.
- Bedroom count where applicable.
- Bathroom or toilet count where applicable.
- Rent amount.
- Rent frequency.
- At least one disclosure about additional charges, including an explicit `none known` option.
- Availability date.
- Public description.
- At least three usable images for an ordinary full listing, unless an administrator applies an exception.
- Contact phone or approved contact method.
- Confirmation that the lister is authorized to advertise the property.

### Recommended locally useful fields

- Landmark.
- Water source.
- Water storage.
- Electricity meter type.
- Estimated power situation notes.
- Road access.
- Parking.
- Compound type.
- Security features.
- Kitchen type.
- Furnished state.
- Pets policy.
- Student or family restrictions, expressed carefully and reviewed for unfair or unlawful discrimination.
- Service charge and what it covers.
- Inspection arrangements.

## 14. Listing lifecycle

### Internal workflow states

- `draft`
- `submitted`
- `changes_requested`
- `approved`
- `rejected`
- `suspended`
- `archived`

### Public availability states

- `available`
- `inspection_ongoing`
- `application_pending`
- `taken`
- `paused`
- `confirmation_overdue`
- `under_review`

Workflow state and availability state are separate. An approved listing can be paused or taken without losing its moderation history.

### Suggested transitions

- Draft to submitted: lister submits complete listing.
- Submitted to approved: moderator accepts.
- Submitted to changes requested: moderator returns actionable feedback.
- Approved and available to taken: lister or administrator records vacancy closure.
- Approved and available to confirmation overdue: scheduled freshness rule fires.
- Confirmation overdue to available: lister reconfirms.
- Available to under review: credible report or moderation action.
- Any public state to suspended: administrator action.

Every public status change must create a status-history record with actor, time, previous state, new state, and reason where appropriate.

## 15. Availability freshness

Freshness thresholds must be configurable. A sensible starting policy for testing is:

- Fresh: confirmed within 72 hours.
- Recent: confirmed within 7 days.
- Confirmation overdue: not confirmed after 7 days.
- Suppress from ordinary search after 14 days without confirmation.

These are product assumptions, not permanent constants. Store them in configuration rather than scattering numeric values through code.

The lister should be able to reconfirm with a simple authenticated action. The platform should record who confirmed, when, and by what channel. A property reported as taken should enter a moderator-visible workflow rather than being automatically deleted.

## 16. Views and inquiries

### 16.1 Qualified view

A qualified view is a deduplicated, non-bot visit to a property-detail page that satisfies a minimum engagement rule. Suggested MVP rule:

- The visitor has a random anonymous browser ID or an authenticated user ID.
- The page remains visible for at least five seconds, or another product-approved engagement event occurs.
- The listing owner, administrators, automated tests, and known bots are excluded.
- The same anonymous or authenticated visitor counts once per listing within a configurable 24-hour window.

Do not use invasive device fingerprinting. Store only data needed for deduplication, fraud control, and aggregate reporting.

### 16.2 Inquiry

An inquiry is an explicit intent signal, such as:

- Call-button click.
- WhatsApp-button click.
- Inspection request.
- `I am interested` form submission.

Opening a listing is not an inquiry. The public page shows aggregates only. The lister dashboard may show permitted inquiry details when the user provided them and consented to contact.

### 16.3 Display rules

- State the time period, such as `in the past 7 days`.
- Do not fabricate live-view claims.
- Consider hiding or bucketing very small numbers to protect privacy and avoid misleading precision.
- Do not expose names or contact details of interested users publicly.

## 17. Contact and inspection

### Call and WhatsApp

- Contact actions should pass through a server-controlled tracking route before redirecting or revealing the approved contact channel.
- The system must rate-limit abuse.
- The lister's public number may be displayed only according to the chosen privacy policy.
- In a stricter version, reveal the number after a deliberate user action rather than embedding it in initial page HTML.

### Inspection request

The form should collect only what is needed:

- Name.
- Phone or chosen contact method.
- Preferred date or time range.
- Optional message.
- Consent to share the submitted details with the lister.

The MVP does not take payment for inspections. Statuses may include `new`, `acknowledged`, `scheduled`, `completed`, `cancelled`, and `spam`.

## 18. Lister dashboard requirements

A lister can:

- See current listing counts by status.
- Create a draft.
- Edit owned drafts and permitted fields on published listings.
- Upload, reorder, caption, and remove media.
- Submit for review.
- View moderation feedback.
- Reconfirm availability.
- Change public availability to paused, inspection ongoing, application pending, or taken.
- View qualified views and inquiries.
- Respond to or update inspection requests.
- Manage public profile and approved contact methods.
- View verification labels and outstanding requirements.

A lister cannot:

- Approve their own listing.
- Change verification badges.
- Read another lister's inquiries.
- Access private reporter details.
- Alter audit history.

## 19. Admin and moderation requirements

Administrators or moderators need:

- A review queue with filters and priority signals.
- Side-by-side listing details, media, lister history, and potential duplicates.
- Approve, request changes, reject, hide, suspend, or archive actions.
- Structured reasons and optional internal notes.
- Report triage.
- Availability-overdue queue.
- Lister verification management.
- User-role management with safeguards.
- Audit-log search.
- Ability to correct obvious data issues without erasing the original record.
- Ability to mark test, spam, duplicate, or fraudulent records.

Sensitive verification documents should be accessible only to specifically authorized roles and should never appear in general analytics or public media storage.

## 20. Verification model

Badges must describe the check performed. Possible labels include:

- Phone verified.
- Identity reviewed.
- Business reviewed.
- Professional registration reviewed.
- Property access verified.
- Landlord authorization reviewed.
- Platform-inspected property.

A paid service must not automatically produce a positive badge. A property-access check does not prove ownership. Every badge needs an issue date, optional expiry, issuing actor or process, evidence reference, and revocation capability.

## 21. Media requirements

### Images

- At least three images for a normal published listing unless an exception is approved.
- Validate file type and size server-side.
- Strip unnecessary metadata where practical.
- Generate multiple responsive sizes and a thumbnail.
- Preserve sensible orientation.
- Store accessible captions or alternative text.
- Allow ordered galleries.
- Use a placeholder when media is missing or under moderation.

### Video

- Optional in the MVP.
- No autoplay.
- Strict duration and file-size limits.
- Generate a poster image.
- Use adaptive or optimized delivery if the chosen media service supports it.
- Provide clear upload progress and recoverable errors.
- A failed video upload must not destroy the rest of the draft.

### Moderation

Media can have `pending`, `approved`, `rejected`, or `quarantined` state. Public pages must not return unapproved media.

## 22. Low-bandwidth and mobile requirements

- Design first for common narrow screens.
- Use responsive images and lazy loading.
- Do not autoplay video.
- Avoid large JavaScript bundles for simple pages.
- Provide useful skeletons or progress indicators.
- Keep search filters usable with touch and keyboard.
- Preserve form drafts when practical.
- Allow listers to upload images one at a time and retry failed items.
- Consider a user-controlled low-data mode after the core MVP.
- Ensure critical actions remain understandable when media is slow or unavailable.

## 23. Accessibility requirements

- Semantic headings and landmarks.
- Keyboard-operable menus, dialogs, forms, and galleries.
- Visible focus states.
- Sufficient text contrast.
- Form labels and specific validation messages.
- Meaningful alternative text for property media.
- Captions or a text summary for important video information.
- Do not encode availability or verification by color alone.
- Respect reduced-motion preferences.

## 24. SEO and sharing

- Server-render public listing pages where practical.
- Use descriptive page titles and summaries.
- Generate canonical URLs.
- Provide social-sharing metadata using approved public images.
- Mark taken listings clearly and recommend available alternatives.
- Do not expose private addresses in metadata, structured data, image filenames, or sitemaps.
- Remove unpublished listings from public indexing.

## 25. Notifications

Initial channels may include email, in-app messages, and later SMS or WhatsApp, depending on provider setup and consent.

Events worth notifying:

- Listing submitted.
- Changes requested.
- Listing approved or rejected.
- Availability confirmation due.
- Listing moved to confirmation overdue.
- New inspection request.
- Inspection status changed.
- Listing reported or placed under review.
- Saved-search match, after seeker accounts and alerts are implemented.

All marketing notifications require appropriate preference controls. Operational messages should be clearly distinguished from promotional messages.

## 26. Analytics events

At minimum record privacy-conscious events for:

- Search submitted.
- Filter applied or cleared.
- Result card opened.
- Qualified view.
- Gallery interaction.
- Video started.
- Call clicked.
- WhatsApp clicked.
- Inspection requested.
- Listing saved.
- Listing reported.
- Listing submitted.
- Listing approved.
- Availability reconfirmed.
- Listing marked taken.

Analytics must not become a back door for exposing private address or identity data.

## 27. Success metrics

### Supply quality

- Number of currently available listings.
- Percentage confirmed within the freshness window.
- Percentage with sufficient media.
- Percentage with meaningful verification labels.
- Duplicate rate.
- Stale-listing report rate.

### Demand and conversion

- Search-to-detail conversion.
- Detail-to-inquiry conversion.
- Inquiry-to-inspection conversion where tracked.
- Repeat seeker rate.
- Saved-search and alert use.

### Lister quality

- Median response time.
- Percentage of listings marked taken promptly.
- Availability-confirmation response rate.
- Repeat lister rate.
- Reports per 100 active listings.

### Platform health

- Moderation turnaround.
- Upload failure rate.
- Page performance on mobile connections.
- Error rate for contact actions.
- Number and resolution time of credible fraud reports.

A useful headline metric is `fresh, available vacancies today` rather than total historical listings.

## 28. Revenue boundaries

Potential post-validation revenue:

- Clearly labelled featured listings.
- Professional lister subscriptions.
- Photography and walkthrough-video service.
- Property-access verification service.
- Branded agent pages.
- Team and reporting tools.

The MVP should not require a seeker to pay merely to see basic listing details or contact a lister. In-house agency inventory must be labelled and must not receive hidden ranking preference.

## 29. Compliance and operating readiness

Before public launch, obtain qualified local review of:

- Privacy and data-retention practices.
- Terms of service and acceptable-use policy.
- Consumer complaints and refund implications for paid promotion.
- Advertising and agency disclosures.
- Identity and verification wording.
- Record handling for minors or vulnerable users.
- Incident response and breach procedures.

This document is a product specification, not legal advice.

## 30. MVP release definition

The MVP is ready for a controlled pilot when:

- Guests can search and open safe public listing pages.
- Listers can create and manage listings through review and status updates.
- Admins can moderate, investigate reports, and manage freshness.
- Media is validated and delivered responsively.
- Qualified views and explicit inquiries are counted separately.
- Private addresses and sensitive records are protected.
- Critical flows pass the acceptance tests.
- The service has clear safety, privacy, contact, and complaints pages.
- The team can manually support users and correct problems during the pilot.
