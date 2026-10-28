# Data Model and Access Design

## Design principles

- A physical property and a vacancy listing are separate records.
- Public pages use safe projections, not raw tables.
- Workflow state and public availability state are separate.
- Significant changes are append-only in history or audit records.
- Money uses an exact integer representation.
- Time is stored consistently with timezone-aware timestamps.
- Sensitive evidence and private addresses are access-restricted.
- Deletion behavior is deliberate; do not cascade away audit evidence accidentally.

## Core enums

### User role

- `seeker`
- `lister`
- `moderator`
- `admin`

### Lister type

- `landlord`
- `agent`
- `caretaker`
- `firm`
- `platform_in_house`

### Listing workflow state

- `draft`
- `submitted`
- `changes_requested`
- `approved`
- `rejected`
- `suspended`
- `archived`

### Availability state

- `available`
- `inspection_ongoing`
- `application_pending`
- `taken`
- `paused`
- `confirmation_overdue`
- `under_review`

### Media state

- `pending`
- `approved`
- `rejected`
- `quarantined`

### Media type

- `image`
- `video`

### Inquiry type

- `call_click`
- `whatsapp_click`
- `inspection_request`
- `interest_form`

### Verification type

- `phone`
- `identity_review`
- `business_review`
- `professional_registration_review`
- `property_access`
- `landlord_authorization`
- `platform_inspection`

## Tables

## 1. profiles

Purpose: Common account identity and role information.

Suggested fields:

- `id uuid primary key` linked to auth identity.
- `role user_role not null`.
- `display_name text`.
- `email text nullable`.
- `phone_e164 text nullable`.
- `phone_verified_at timestamptz nullable`.
- `avatar_path text nullable`.
- `account_status text`.
- `created_at timestamptz`.
- `updated_at timestamptz`.

Notes:

- Do not make raw phone fields public by default.
- Role changes should be audited.
- Consider a separate role-assignment table if one account may hold multiple roles later.

## 2. lister_profiles

Purpose: Public and operational information for a lister.

Suggested fields:

- `profile_id uuid primary key references profiles`.
- `lister_type lister_type`.
- `business_name text nullable`.
- `public_slug text unique`.
- `bio text nullable`.
- `public_contact_policy text`.
- `approved_public_phone text nullable`.
- `service_areas text[] or relation`.
- `is_accepting_inquiries boolean`.
- `created_at` and `updated_at`.

Computed performance metrics should normally come from aggregates rather than editable profile fields.

## 3. areas

Purpose: Controlled list of areas and neighbourhoods for search consistency.

Suggested fields:

- `id uuid primary key`.
- `name text`.
- `slug text unique`.
- `parent_area_id uuid nullable`.
- `city text default Jos`.
- `state text default Plateau`.
- `is_active boolean`.
- `sort_order integer`.

Do not place private street addresses in this table.

## 4. properties

Purpose: Represents a physical property independent of a vacancy period.

Suggested fields:

- `id uuid primary key`.
- `created_by uuid references profiles`.
- `assigned_lister_id uuid references profiles`.
- `area_id uuid references areas`.
- `private_address_line text`.
- `private_address_notes text nullable`.
- `public_landmark text nullable`.
- `approx_lat numeric nullable`.
- `approx_lng numeric nullable`.
- `property_type text`.
- `bedrooms smallint nullable`.
- `bathrooms smallint nullable`.
- `toilets smallint nullable`.
- `parking_spaces smallint nullable`.
- `furnishing_state text`.
- `water_source text nullable`.
- `electricity_meter text nullable`.
- `compound_type text nullable`.
- `access_notes text nullable`.
- `created_at` and `updated_at`.

Public queries must never select `private_address_line` or `private_address_notes`.

## 5. listings

Purpose: Represents one advertised vacancy period for a property.

Suggested fields:

- `id uuid primary key`.
- `property_id uuid references properties`.
- `created_by uuid references profiles`.
- `slug text unique`.
- `reference_code text unique`.
- `title text`.
- `description text`.
- `workflow_state listing_workflow_state`.
- `availability_state availability_state`.
- `rent_amount_minor bigint`.
- `currency text default NGN`.
- `rent_frequency text`.
- `agency_fee_minor bigint nullable`.
- `legal_fee_minor bigint nullable`.
- `caution_fee_minor bigint nullable`.
- `service_charge_minor bigint nullable`.
- `other_fee_minor bigint nullable`.
- `other_fee_label text nullable`.
- `fees_disclosure_state text`.
- `available_from date nullable`.
- `last_confirmed_at timestamptz nullable`.
- `confirmation_due_at timestamptz nullable`.
- `published_at timestamptz nullable`.
- `taken_at timestamptz nullable`.
- `paused_at timestamptz nullable`.
- `sponsored_until timestamptz nullable`.
- `sponsorship_label text nullable`.
- `created_at` and `updated_at`.

The estimated move-in total should be calculated through tested business logic, not maintained as an independently editable amount.

## 6. listing_media

Purpose: Property listing images and videos.

Suggested fields:

- `id uuid primary key`.
- `listing_id uuid references listings`.
- `uploaded_by uuid references profiles`.
- `media_type media_type`.
- `storage_path text`.
- `poster_path text nullable`.
- `thumbnail_path text nullable`.
- `mime_type text`.
- `size_bytes bigint`.
- `width integer nullable`.
- `height integer nullable`.
- `duration_seconds integer nullable`.
- `alt_text text nullable`.
- `caption text nullable`.
- `sort_order integer`.
- `moderation_state media_state`.
- `rejection_reason text nullable`.
- `created_at` and `updated_at`.

Storage policies must prevent a lister from attaching or deleting another lister's media.

## 7. listing_status_history

Purpose: Immutable history of workflow and availability changes.

Suggested fields:

- `id uuid primary key`.
- `listing_id uuid references listings`.
- `actor_id uuid nullable references profiles`.
- `change_type text`.
- `previous_workflow_state nullable`.
- `new_workflow_state nullable`.
- `previous_availability_state nullable`.
- `new_availability_state nullable`.
- `reason_code text nullable`.
- `note text nullable`.
- `source text` such as dashboard, admin, scheduled job, or report.
- `created_at timestamptz`.

Ordinary users cannot edit or delete history.

## 8. availability_confirmations

Purpose: Records every availability confirmation attempt or success.

Suggested fields:

- `id uuid primary key`.
- `listing_id uuid references listings`.
- `confirmed_by uuid nullable references profiles`.
- `channel text`.
- `result text`.
- `confirmation_token_hash text nullable`.
- `confirmed_at timestamptz nullable`.
- `expires_at timestamptz nullable`.
- `created_at timestamptz`.

Do not store raw confirmation tokens.

## 9. anonymous_visitors

Purpose: Optional server-side record for privacy-conscious view deduplication.

Suggested fields:

- `id uuid primary key` corresponding to a random cookie ID.
- `created_at timestamptz`.
- `last_seen_at timestamptz`.
- `abuse_state text nullable`.

Avoid collecting a detailed device fingerprint. A hashed, truncated network signal may be used only when justified for abuse control and with an explicit retention policy.

## 10. listing_view_events

Purpose: Records qualified or candidate listing views.

Suggested fields:

- `id uuid primary key`.
- `listing_id uuid references listings`.
- `viewer_profile_id uuid nullable references profiles`.
- `anonymous_visitor_id uuid nullable`.
- `session_id uuid nullable`.
- `qualified_at timestamptz`.
- `source text nullable`.
- `day_bucket date`.
- `is_excluded boolean default false`.
- `exclusion_reason text nullable`.

Use a unique or idempotency rule that prevents the same viewer from repeatedly qualifying within the configured window. At larger scale, retain detailed events briefly and roll them into aggregates.

## 11. listing_metrics_daily

Purpose: Efficient aggregate display and reporting.

Suggested fields:

- `listing_id uuid`.
- `metric_date date`.
- `qualified_views integer`.
- `call_clicks integer`.
- `whatsapp_clicks integer`.
- `inspection_requests integer`.
- `interest_forms integer`.
- Composite primary key on listing and date.

Aggregation jobs must be idempotent.

## 12. inquiries

Purpose: Explicit intent events and, where permitted, contact details.

Suggested fields:

- `id uuid primary key`.
- `listing_id uuid references listings`.
- `seeker_profile_id uuid nullable references profiles`.
- `anonymous_visitor_id uuid nullable`.
- `inquiry_type inquiry_type`.
- `name text nullable`.
- `phone_e164 text nullable`.
- `email text nullable`.
- `message text nullable`.
- `consent_to_share boolean`.
- `lister_status text nullable`.
- `created_at` and `updated_at`.

Contact-click events do not require the same personal fields as an inspection request.

## 13. inspection_requests

Purpose: Structured scheduling request, optionally related to an inquiry.

Suggested fields:

- `id uuid primary key`.
- `inquiry_id uuid nullable references inquiries`.
- `listing_id uuid references listings`.
- `requester_profile_id uuid nullable`.
- `requester_name text`.
- `requester_phone_e164 text`.
- `preferred_date date nullable`.
- `preferred_time_window text nullable`.
- `message text nullable`.
- `status text`.
- `assigned_lister_id uuid`.
- `created_at` and `updated_at`.

Only the assigned lister and authorized staff can view requester contact details.

## 14. favorites

Purpose: Saved listings for registered seekers.

Suggested fields:

- `profile_id uuid references profiles`.
- `listing_id uuid references listings`.
- `created_at timestamptz`.
- Composite primary key on profile and listing.

## 15. saved_searches

Purpose: Repeat search and alert preferences.

Suggested fields:

- `id uuid primary key`.
- `profile_id uuid references profiles`.
- `name text`.
- `filters jsonb` validated by a schema.
- `alerts_enabled boolean`.
- `alert_frequency text`.
- `last_notified_at timestamptz nullable`.
- `created_at` and `updated_at`.

Do not allow arbitrary JSON to bypass validation or create expensive queries.

## 16. reports

Purpose: User or staff reports about a listing or lister.

Suggested fields:

- `id uuid primary key`.
- `listing_id uuid nullable`.
- `reported_profile_id uuid nullable`.
- `reporter_profile_id uuid nullable`.
- `anonymous_visitor_id uuid nullable`.
- `reason_code text`.
- `details text nullable`.
- `evidence_path text nullable`.
- `status text`.
- `priority text`.
- `assigned_to uuid nullable`.
- `resolution_code text nullable`.
- `resolved_at timestamptz nullable`.
- `created_at` and `updated_at`.

A lister may be informed that a report exists without receiving the reporter's identity.

## 17. verification_records

Purpose: Precise, revocable verification results.

Suggested fields:

- `id uuid primary key`.
- `subject_type text` such as profile, business, property, or listing.
- `subject_id uuid`.
- `verification_type verification_type`.
- `status text`.
- `evidence_path text nullable`.
- `evidence_summary text nullable`.
- `reviewed_by uuid nullable`.
- `issued_at timestamptz nullable`.
- `expires_at timestamptz nullable`.
- `revoked_at timestamptz nullable`.
- `revocation_reason text nullable`.
- `created_at` and `updated_at`.

Public badges must be derived only from valid, non-expired, non-revoked records.

## 18. notifications

Purpose: Operational and preference-controlled messages.

Suggested fields:

- `id uuid primary key`.
- `recipient_profile_id uuid`.
- `channel text`.
- `template_key text`.
- `payload jsonb`.
- `status text`.
- `scheduled_at timestamptz nullable`.
- `sent_at timestamptz nullable`.
- `failure_reason text nullable`.
- `created_at`.

Avoid placing secrets or unnecessary private data in notification payloads.

## 19. audit_logs

Purpose: Security and operational accountability.

Suggested fields:

- `id uuid primary key`.
- `actor_id uuid nullable`.
- `action text`.
- `target_type text`.
- `target_id uuid nullable`.
- `before_summary jsonb nullable`.
- `after_summary jsonb nullable`.
- `request_id text nullable`.
- `created_at timestamptz`.

Audit summaries should avoid copying full identity documents, passwords, tokens, or raw sensitive payloads.

## 20. platform_settings

Purpose: Configurable product rules.

Suggested fields:

- `key text primary key`.
- `value jsonb`.
- `updated_by uuid`.
- `updated_at timestamptz`.

Candidate settings:

- Freshness windows.
- Search suppression window.
- Maximum media size.
- Maximum video duration.
- Minimum image count.
- Inquiry rate limits.
- Report reason list.

Use a schema and controlled admin UI; do not allow arbitrary settings to execute code.

## Relationships summary

- One profile may have one lister profile.
- One property may have many vacancy listings over time.
- One listing has many media records, views, inquiries, reports, confirmations, and status-history records.
- One seeker may save many listings and searches.
- Verification may apply to a profile, firm, property, or listing.
- Audit records reference many target types but are not the source of operational truth.

## Public projection

Create a database view, server query, or typed mapper that exposes only approved fields. A public listing object should include:

- Listing ID, slug, reference code, title, description.
- Approved availability state and freshness.
- Rent and fee summary.
- Property type and public features.
- Area and public landmark.
- Approximate location only.
- Approved media only.
- Safe lister display data and valid badge labels.
- Aggregate metrics.

It must exclude:

- Private address.
- Internal notes.
- Raw phone fields that are not approved for display.
- Verification evidence paths.
- Reporter information.
- Audit data.
- Moderation risk signals.

## Access matrix

### Guest

- Read approved public listing projection.
- Create rate-limited view events, contact-click inquiries, inspection requests, and reports.
- Cannot read private tables directly.

### Seeker

- Same public access as guest.
- Manage own favorites, saved searches, inquiry history, and preferences.

### Lister

- Read and edit owned profile, properties, listings, permitted media, and assigned inquiries.
- Read moderation feedback on own listings.
- Cannot approve own listings, alter badges, or access other listers' data.

### Moderator

- Read and act on review queues, listings, reports, and selected lister history.
- Access only the verification evidence needed for assigned duties.
- Cannot silently change system roles or platform-wide security settings.

### Administrator

- Broad operational access with audit logging.
- Sensitive actions should require deliberate UI confirmation and, where practical, recent authentication.

## Suggested indexes

- Listings by workflow state, availability state, published time, area, property type, rent amount, and bedroom count.
- Listings by last confirmed and confirmation due time.
- Properties by area.
- Media by listing and sort order.
- Inquiries by listing, assigned lister, type, and created time.
- Reports by status, priority, listing, and created time.
- Status history by listing and created time.
- View events by listing, viewer key, and qualification time.
- Daily metrics by date.
- Unique lowercased public slugs.

Review every index against actual query plans during pilot growth rather than indexing every field blindly.
