-- JosHomes Milestone 1 — core schema
-- Mirrors docs/DATA_MODEL.md. Money is stored as integer minor units (kobo).
-- Timestamps are timezone-aware. A physical property and a vacancy listing are
-- separate records. Private columns live here but are never exposed publicly;
-- public reads must go through the public_listings view (0002) under RLS (0003).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('seeker', 'lister', 'moderator', 'admin');

create type lister_type as enum ('landlord', 'agent', 'caretaker', 'firm', 'platform_in_house');

create type listing_workflow_state as enum (
  'draft', 'submitted', 'changes_requested', 'approved', 'rejected', 'suspended', 'archived'
);

create type availability_state as enum (
  'available', 'inspection_ongoing', 'application_pending', 'taken',
  'paused', 'confirmation_overdue', 'under_review'
);

create type media_state as enum ('pending', 'approved', 'rejected', 'quarantined');
create type media_type as enum ('image', 'video');
create type fee_disclosure_state as enum ('none_known', 'fees_listed', 'not_stated');
create type rent_frequency as enum ('annual', 'monthly');
create type furnishing_state as enum ('unfurnished', 'semi_furnished', 'furnished');

create type verification_type as enum (
  'phone', 'identity_review', 'business_review', 'professional_registration_review',
  'property_access', 'landlord_authorization', 'platform_inspection'
);

-- ---------------------------------------------------------------------------
-- profiles — account identity and role
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key,                       -- matches the auth identity id
  role user_role not null default 'seeker',
  display_name text not null,
  email text unique,
  -- PRIVATE: raw phone is never selected by a public query.
  phone_e164 text,
  phone_verified_at timestamptz,
  avatar_path text,
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column profiles.phone_e164 is 'PRIVATE. Never expose through a public projection.';

-- ---------------------------------------------------------------------------
-- lister_profiles — public-facing lister information
-- ---------------------------------------------------------------------------

create table lister_profiles (
  profile_id uuid primary key references profiles (id) on delete cascade,
  lister_type lister_type not null,
  business_name text,
  public_slug text not null unique,
  bio text,
  public_contact_policy text not null default 'reveal_on_action'
    check (public_contact_policy in ('reveal_on_action', 'display_direct', 'masked')),
  -- Only a number the lister approved for display. Still gated by contact policy.
  approved_public_phone text,
  is_accepting_inquiries boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index lister_profiles_slug_lower_idx on lister_profiles (lower(public_slug));

-- ---------------------------------------------------------------------------
-- areas — controlled public area list (never holds street addresses)
-- ---------------------------------------------------------------------------

create table areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_area_id uuid references areas (id),
  city text not null default 'Jos',
  state text not null default 'Plateau',
  is_active boolean not null default true,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- properties — a physical property, independent of any vacancy period
-- ---------------------------------------------------------------------------

create table properties (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references profiles (id),
  assigned_lister_id uuid not null references profiles (id),
  area_id uuid not null references areas (id),

  -- PRIVATE: must never appear in a public projection (acceptance A5).
  private_address_line text not null,
  private_address_notes text,

  public_landmark text,
  approx_location_label text,
  approx_lat numeric(9, 6),
  approx_lng numeric(9, 6),

  property_type text not null,
  bedrooms smallint check (bedrooms >= 0),
  bathrooms smallint check (bathrooms >= 0),
  toilets smallint check (toilets >= 0),
  parking_spaces smallint check (parking_spaces >= 0),
  furnishing_state furnishing_state not null default 'unfurnished',
  water_source text,
  electricity_meter text,
  compound_type text,
  access_notes text,
  features text[] not null default '{}',
  house_rules text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column properties.private_address_line is
  'PRIVATE. Never selected by public_listings. See docs/ACCEPTANCE_TESTS.md A5.';

create index properties_area_idx on properties (area_id);
create index properties_assigned_lister_idx on properties (assigned_lister_id);

-- ---------------------------------------------------------------------------
-- listings — one advertised vacancy period for a property
-- ---------------------------------------------------------------------------

create table listings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete restrict,
  created_by uuid not null references profiles (id),

  slug text not null unique,
  reference_code text not null unique,
  title text not null,
  description text not null,

  -- Workflow state and public availability state are deliberately separate.
  workflow_state listing_workflow_state not null default 'draft',
  availability_state availability_state not null default 'available',

  rent_amount_minor bigint not null check (rent_amount_minor >= 0),
  currency text not null default 'NGN',
  rent_frequency rent_frequency not null default 'annual',

  -- NULL means "not stated" (unknown) and is excluded from the estimated total.
  agency_fee_minor bigint check (agency_fee_minor >= 0),
  legal_fee_minor bigint check (legal_fee_minor >= 0),
  caution_fee_minor bigint check (caution_fee_minor >= 0),
  service_charge_minor bigint check (service_charge_minor >= 0),
  other_fee_minor bigint check (other_fee_minor >= 0),
  other_fee_label text,
  fees_disclosure_state fee_disclosure_state not null default 'not_stated',

  available_from date,
  last_confirmed_at timestamptz,
  confirmation_due_at timestamptz,
  published_at timestamptz,
  taken_at timestamptz,
  paused_at timestamptz,
  sponsored_until timestamptz,
  sponsorship_label text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index listings_slug_lower_idx on listings (lower(slug));
create index listings_workflow_idx on listings (workflow_state);
create index listings_availability_idx on listings (availability_state);
create index listings_published_idx on listings (published_at desc);
create index listings_last_confirmed_idx on listings (last_confirmed_at desc);
create index listings_confirmation_due_idx on listings (confirmation_due_at);
create index listings_rent_idx on listings (rent_amount_minor);
create index listings_property_idx on listings (property_id);

-- ---------------------------------------------------------------------------
-- listing_media — images and video, with moderation state
-- ---------------------------------------------------------------------------

create table listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  uploaded_by uuid not null references profiles (id),
  media_type media_type not null default 'image',
  storage_path text not null,
  poster_path text,
  thumbnail_path text,
  mime_type text,
  size_bytes bigint check (size_bytes >= 0),
  width integer,
  height integer,
  duration_seconds integer,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  -- Only 'approved' media is ever published (acceptance B3).
  moderation_state media_state not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listing_media_listing_order_idx on listing_media (listing_id, sort_order);

-- ---------------------------------------------------------------------------
-- listing_status_history — append-only record of state changes
-- ---------------------------------------------------------------------------

create table listing_status_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  actor_id uuid references profiles (id),
  change_type text not null,
  previous_workflow_state listing_workflow_state,
  new_workflow_state listing_workflow_state,
  previous_availability_state availability_state,
  new_availability_state availability_state,
  reason_code text,
  note text,
  source text not null default 'dashboard',
  created_at timestamptz not null default now()
);

create index listing_status_history_listing_idx on listing_status_history (listing_id, created_at desc);

-- ---------------------------------------------------------------------------
-- verification_records — precise, revocable verification results
-- ---------------------------------------------------------------------------

create table verification_records (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile', 'business', 'property', 'listing')),
  subject_id uuid not null,
  verification_type verification_type not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  -- PRIVATE: evidence pointers are restricted to authorized staff only.
  evidence_path text,
  evidence_summary text,
  reviewed_by uuid references profiles (id),
  issued_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column verification_records.evidence_path is
  'PRIVATE. Restricted to authorized staff; never public (acceptance H4).';

create index verification_records_subject_idx on verification_records (subject_type, subject_id);

-- ---------------------------------------------------------------------------
-- audit_logs — accountability for sensitive actions
-- ---------------------------------------------------------------------------

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  target_type text not null,
  target_id uuid,
  before_summary jsonb,
  after_summary jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_idx on audit_logs (actor_id, created_at desc);
create index audit_logs_target_idx on audit_logs (target_type, target_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger lister_profiles_set_updated_at before update on lister_profiles
  for each row execute function set_updated_at();
create trigger properties_set_updated_at before update on properties
  for each row execute function set_updated_at();
create trigger listings_set_updated_at before update on listings
  for each row execute function set_updated_at();
create trigger listing_media_set_updated_at before update on listing_media
  for each row execute function set_updated_at();
create trigger verification_records_set_updated_at before update on verification_records
  for each row execute function set_updated_at();
