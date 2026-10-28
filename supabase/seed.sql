-- JosHomes — reproducible fictional seed.
--
-- Safe to run repeatedly: it deletes the seeded rows (by their fixed UUIDs)
-- before re-inserting. Contains NO real people, phone numbers, addresses, or
-- photos. Phone numbers use the clearly fake +234800000000X pattern and are
-- private in any case. Times are relative to now() so freshness stays realistic.

begin;

-- ---------------------------------------------------------------------------
-- Reset seeded data (FK-safe order)
-- ---------------------------------------------------------------------------
delete from listing_media          where listing_id in (select id from listings where reference_code like 'JH-1%');
delete from listing_status_history where listing_id in (select id from listings where reference_code like 'JH-1%');
delete from listings               where reference_code like 'JH-1%';
delete from properties             where id::text like 'c0000000-%';
delete from verification_records   where subject_id::text like 'a0000000-%';
delete from lister_profiles        where profile_id::text like 'a0000000-%';
delete from profiles               where id::text like 'a0000000-%';
delete from areas                  where id::text like 'b0000000-%';

-- ---------------------------------------------------------------------------
-- Areas
-- ---------------------------------------------------------------------------
insert into areas (id, name, slug, sort_order) values
  ('b0000000-0000-4000-8000-000000000001', 'Rayfield',        'rayfield',        1),
  ('b0000000-0000-4000-8000-000000000002', 'Bukuru',          'bukuru',          2),
  ('b0000000-0000-4000-8000-000000000003', 'Farin Gada',      'farin-gada',      3),
  ('b0000000-0000-4000-8000-000000000004', 'Tudun Wada',      'tudun-wada',      4),
  ('b0000000-0000-4000-8000-000000000005', 'Rukuba Road',     'rukuba-road',     5),
  ('b0000000-0000-4000-8000-000000000006', 'Anglo Jos',       'anglo-jos',       6),
  ('b0000000-0000-4000-8000-000000000007', 'Dadin Kowa',      'dadin-kowa',      7),
  ('b0000000-0000-4000-8000-000000000008', 'State Low Cost',  'state-low-cost',  8),
  ('b0000000-0000-4000-8000-000000000009', 'Lamingo',         'lamingo',         9),
  ('b0000000-0000-4000-8000-000000000010', 'Kabong',          'kabong',         10);

-- ---------------------------------------------------------------------------
-- Profiles (fictional). Roles cover every level of the access matrix.
-- ---------------------------------------------------------------------------
insert into profiles (id, role, display_name, email, phone_e164, phone_verified_at) values
  ('a0000000-0000-4000-8000-000000000001', 'lister',    'Grace Estates (fictional)',      'grace@example.test',   '+2348000000001', now()),
  ('a0000000-0000-4000-8000-000000000002', 'lister',    'Daniel Danjuma (fictional)',     'daniel@example.test',  '+2348000000002', now()),
  ('a0000000-0000-4000-8000-000000000003', 'lister',    'Plateau Homes Ltd (fictional)',  'firm@example.test',    '+2348000000003', now()),
  ('a0000000-0000-4000-8000-000000000004', 'lister',    'Joy Pam (fictional caretaker)',  'joy@example.test',     '+2348000000004', now()),
  ('a0000000-0000-4000-8000-000000000005', 'lister',    'JosHomes in-house agency',       'inhouse@example.test', '+2348000000005', now()),
  ('a0000000-0000-4000-8000-000000000006', 'seeker',    'Amina Seeker (fictional)',       'seeker@example.test',  null,             null),
  ('a0000000-0000-4000-8000-000000000007', 'moderator', 'Moderator (fictional)',          'mod@example.test',     null,             null),
  ('a0000000-0000-4000-8000-000000000008', 'admin',     'Administrator (fictional)',      'admin@example.test',   null,             null);

insert into lister_profiles (profile_id, lister_type, business_name, public_slug) values
  ('a0000000-0000-4000-8000-000000000001', 'agent',             'Grace Estates (fictional)',     'grace-estates'),
  ('a0000000-0000-4000-8000-000000000002', 'landlord',          null,                            'daniel-danjuma'),
  ('a0000000-0000-4000-8000-000000000003', 'firm',              'Plateau Homes Ltd (fictional)', 'plateau-homes'),
  ('a0000000-0000-4000-8000-000000000004', 'caretaker',         null,                            'joy-caretaker'),
  ('a0000000-0000-4000-8000-000000000005', 'platform_in_house', 'JosHomes in-house agency',      'joshomes-in-house');

-- Verification records. Only active, non-expired, non-revoked ones become badges.
insert into verification_records
  (subject_type, subject_id, verification_type, status, issued_at, expires_at, revoked_at, evidence_path)
values
  ('profile', 'a0000000-0000-4000-8000-000000000001', 'phone',                  'active', now(), null, null, 'private/evidence/phone/1'),
  ('profile', 'a0000000-0000-4000-8000-000000000001', 'property_access',        'active', now(), null, null, 'private/evidence/access/1'),
  ('profile', 'a0000000-0000-4000-8000-000000000002', 'phone',                  'active', now(), null, null, 'private/evidence/phone/2'),
  ('profile', 'a0000000-0000-4000-8000-000000000002', 'landlord_authorization', 'active', now(), null, null, 'private/evidence/auth/2'),
  ('profile', 'a0000000-0000-4000-8000-000000000003', 'phone',                  'active', now(), null, null, 'private/evidence/phone/3'),
  ('profile', 'a0000000-0000-4000-8000-000000000003', 'business_review',        'active', now(), null, null, 'private/evidence/biz/3'),
  ('profile', 'a0000000-0000-4000-8000-000000000004', 'phone',                  'active', now(), null, null, 'private/evidence/phone/4'),
  ('profile', 'a0000000-0000-4000-8000-000000000005', 'phone',                  'active', now(), null, null, 'private/evidence/phone/5'),
  ('profile', 'a0000000-0000-4000-8000-000000000005', 'platform_inspection',    'active', now(), null, null, 'private/evidence/inspect/5'),
  -- Expired and revoked examples must NOT appear as badges (acceptance I3).
  ('profile', 'a0000000-0000-4000-8000-000000000001', 'identity_review',        'active', now() - interval '2 years', now() - interval '1 year', null, null),
  ('profile', 'a0000000-0000-4000-8000-000000000003', 'professional_registration_review', 'active', now() - interval '1 year', null, now() - interval '1 month', null);

-- ---------------------------------------------------------------------------
-- Properties (private addresses are clearly fictional and never public)
-- ---------------------------------------------------------------------------
insert into properties (
  id, created_by, assigned_lister_id, area_id,
  private_address_line, private_address_notes, public_landmark, approx_location_label,
  property_type, bedrooms, bathrooms, toilets, parking_spaces, furnishing_state,
  water_source, electricity_meter, features, house_rules
) values
  ('c0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   '12 Fictional Close, Rayfield GRA','Blue gate; ask for the compound caretaker','Near Rayfield Resort','Rayfield area, southern Jos',
   'two_bedroom',2,2,2,2,'unfurnished','Borehole with overhead tank','Prepaid',
   '{"Fenced compound","Tiled floors","Fitted kitchen","Security gate"}','{"No commercial use","Quiet after 10pm"}'),

  ('c0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000003',
   '4 Fictional Lane, Farin Gada',null,'Off Farin Gada roundabout','Farin Gada, northern Jos',
   'self_contained',1,1,1,1,'unfurnished','Shared borehole','Prepaid',
   '{"Tiled floors","Burglary proof"}','{"No loud music"}'),

  ('c0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000004',
   '9 Fictional Street, Tudun Wada','Upstairs, left wing','Near Tudun Wada junction','Tudun Wada, central Jos',
   'mini_flat',1,1,1,1,'furnished','Borehole','Prepaid',
   '{"Furnished","Water heater","Wardrobe"}','{"No pets"}'),

  ('c0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000009',
   '21 Fictional Avenue, Lamingo',null,'Off Lamingo dam road','Lamingo, eastern Jos',
   'three_bedroom',3,3,4,3,'semi_furnished','Borehole with treatment','Prepaid',
   '{"En-suite master","Large compound","Boys quarters","Water heater"}','{"Family occupancy preferred"}'),

  ('c0000000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000005','b0000000-0000-4000-8000-000000000008',
   '3 Fictional Boulevard, State Low Cost','Corner house','State Low Cost estate','State Low Cost, Jos',
   'duplex',4,4,5,4,'semi_furnished','Borehole with treatment and storage','Prepaid (3-phase)',
   '{"Duplex","Large compound","Boys quarters","Solar backup"}','{"No commercial use"}'),

  ('c0000000-0000-4000-8000-000000000006','a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000002',
   '15 Fictional Road, Bukuru',null,'Near Bukuru central','Bukuru, southern Jos',
   'two_bedroom',2,1,2,1,'unfurnished','Borehole','Prepaid','{"Tiled floors"}','{}'),

  ('c0000000-0000-4000-8000-000000000007','a0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000004','b0000000-0000-4000-8000-000000000005',
   '18 Fictional Road, Rukuba',null,'Along Rukuba Road','Rukuba Road, northern Jos',
   'self_contained',1,1,1,0,'unfurnished','Shared borehole','Analogue','{}','{}'),

  ('c0000000-0000-4000-8000-000000000008','a0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000006',
   '5 Fictional Lane, Anglo Jos',null,'Near Anglo Jos market','Anglo Jos, central Jos',
   'one_bedroom',1,1,1,1,'unfurnished','Borehole','Prepaid','{"Tiled floors"}','{}');

-- ---------------------------------------------------------------------------
-- Listings — cover every workflow and availability state we must demonstrate.
-- Money is in kobo (NGN * 100).
-- ---------------------------------------------------------------------------
insert into listings (
  id, property_id, created_by, slug, reference_code, title, description,
  workflow_state, availability_state,
  rent_amount_minor, rent_frequency,
  agency_fee_minor, legal_fee_minor, caution_fee_minor, service_charge_minor,
  fees_disclosure_state, available_from, last_confirmed_at, published_at,
  sponsored_until, sponsorship_label
) values
  -- Available + fresh
  ('d0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001',
   'bright-2-bedroom-rayfield','JH-1001','Bright 2 bedroom flat in a quiet Rayfield compound',
   'A well-kept 2 bedroom flat in a gated Rayfield compound with steady water and prepaid metering.',
   'approved','available', 85000000,'annual', 8500000, 4250000, 5000000, null,
   'fees_listed', current_date + 14, now() - interval '2 hours', now() - interval '10 days', null, null),

  -- Available + fresh, direct landlord, no extra fees declared
  ('d0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002',
   'self-contained-farin-gada','JH-1002','Neat self-contained apartment in Farin Gada',
   'A neat self-contained apartment close to Farin Gada market. Prepaid meter and shared borehole.',
   'approved','available', 28000000,'annual', null, null, null, null,
   'none_known', current_date, now() - interval '20 hours', now() - interval '8 days', null, null),

  -- Inspections ongoing + SPONSORED
  ('d0000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001',
   'furnished-mini-flat-tudun-wada','JH-1003','Furnished mini flat near Tudun Wada',
   'A furnished mini flat with a small sitting area. Inspections are being arranged.',
   'approved','inspection_ongoing', 45000000,'annual', 4500000, null, null, 3000000,
   'fees_listed', current_date + 7, now() - interval '4 days', now() - interval '12 days',
   now() + interval '30 days', 'Sponsored listing'),

  -- Available, confirmed yesterday, firm
  ('d0000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000003',
   'family-3-bedroom-lamingo','JH-1004','Spacious 3 bedroom family flat in Lamingo',
   'A spacious 3 bedroom flat suitable for a family, close to Lamingo dam road.',
   'approved','available', 160000000,'annual', 16000000, 8000000, 15000000, null,
   'fees_listed', current_date + 30, now() - interval '30 hours', now() - interval '20 days', null, null),

  -- Available + fresh, in-house agency (must be labelled as such by lister type)
  ('d0000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000005',
   'executive-duplex-state-low-cost','JH-1005','Executive duplex in State Low Cost',
   'An executive 4-bedroom duplex with a large compound, listed by the JosHomes in-house agency.',
   'approved','available', 350000000,'annual', 35000000, 17500000, 30000000, 12000000,
   'fees_listed', current_date + 21, now() - interval '10 hours', now() - interval '5 days', null, null),

  -- TAKEN — must not appear in ordinary available search (A3/E4)
  ('d0000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000006','a0000000-0000-4000-8000-000000000001',
   'taken-2-bedroom-bukuru','JH-1006','2 bedroom flat in Bukuru',
   'A 2 bedroom flat in Bukuru that has now been taken.',
   'approved','taken', 60000000,'annual', 6000000, null, null, null,
   'fees_listed', null, now() - interval '24 hours', now() - interval '30 days', null, null),

  -- STALE (available but unconfirmed for 15 days -> suppressed by policy, E3)
  ('d0000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000007','a0000000-0000-4000-8000-000000000004',
   'stale-self-contained-rukuba-road','JH-1007','Self-contained on Rukuba Road',
   'Availability has not been confirmed for a while, so it is suppressed until reconfirmed.',
   'approved','available', 30000000,'annual', null, null, null, null,
   'none_known', current_date, now() - interval '15 days', now() - interval '40 days', null, null),

  -- UNAPPROVED DRAFT — must never be publicly reachable (A3)
  ('d0000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000008','a0000000-0000-4000-8000-000000000002',
   'draft-hidden-listing','JH-1008','Unapproved draft listing (should never be public)',
   'This draft has not been approved and must not appear on any public page.',
   'draft','available', 40000000,'annual', null, null, null, null,
   'none_known', current_date, now() - interval '1 hour', null, null, null);

-- ---------------------------------------------------------------------------
-- Media. Placeholder storage paths only — no real photos in the repository.
-- One PENDING row proves unapproved media is excluded from the public view (B3).
-- ---------------------------------------------------------------------------
insert into listing_media (listing_id, uploaded_by, storage_path, alt_text, sort_order, moderation_state)
select l.id, l.created_by, m.path, m.alt, m.ord, m.state::media_state
from listings l
join (values
  ('d0000000-0000-4000-8000-000000000001','listings/1001/living.placeholder','Living room with tiled floor',1,'approved'),
  ('d0000000-0000-4000-8000-000000000001','listings/1001/bedroom.placeholder','Main bedroom',2,'approved'),
  ('d0000000-0000-4000-8000-000000000001','listings/1001/kitchen.placeholder','Fitted kitchen',3,'approved'),
  ('d0000000-0000-4000-8000-000000000002','listings/1002/room.placeholder','Self-contained room',1,'approved'),
  ('d0000000-0000-4000-8000-000000000002','listings/1002/bath.placeholder','Bathroom',2,'approved'),
  ('d0000000-0000-4000-8000-000000000003','listings/1003/sitting.placeholder','Furnished sitting area',1,'approved'),
  ('d0000000-0000-4000-8000-000000000003','listings/1003/bedroom.placeholder','Bedroom with wardrobe',2,'approved'),
  ('d0000000-0000-4000-8000-000000000003','listings/1003/pending.placeholder','Awaiting moderation',3,'pending'),
  ('d0000000-0000-4000-8000-000000000004','listings/1004/sitting.placeholder','Sitting room',1,'approved'),
  ('d0000000-0000-4000-8000-000000000005','listings/1005/front.placeholder','Duplex frontage',1,'approved'),
  ('d0000000-0000-4000-8000-000000000006','listings/1006/sitting.placeholder','Sitting room',1,'approved'),
  ('d0000000-0000-4000-8000-000000000007','listings/1007/room.placeholder','Room',1,'approved')
) as m(listing_id, path, alt, ord, state)
  on m.listing_id::uuid = l.id;

-- Status history for the published listings.
insert into listing_status_history (listing_id, actor_id, change_type, new_workflow_state, new_availability_state, source)
select id, created_by, 'seed', workflow_state, availability_state, 'seed'
from listings where reference_code like 'JH-1%';

commit;
