-- JosHomes Milestone 1 — the explicit safe public projection.
--
-- Design: the public (anon) and ordinary signed-in (authenticated) roles have NO
-- direct SELECT on the base tables. All public reads go through this view, which
-- selects ONLY safe columns and only workflow-approved listings. This makes the
-- private address, verification evidence, raw phone numbers, internal notes, and
-- unapproved media unreachable by construction rather than by UI discipline
-- (docs/DATA_MODEL.md "Public projection", acceptance A5 / B3 / H4).
--
-- The view intentionally runs with the definer's rights (it is NOT
-- security_invoker), so it can read base tables that anon cannot read directly.

-- ---------------------------------------------------------------------------
-- Remove the default blanket grants so nothing is public by accident.
-- ---------------------------------------------------------------------------

revoke all on profiles from anon, authenticated;
revoke all on lister_profiles from anon, authenticated;
revoke all on properties from anon, authenticated;
revoke all on listings from anon, authenticated;
revoke all on listing_media from anon, authenticated;
revoke all on listing_status_history from anon, authenticated;
revoke all on verification_records from anon, authenticated;
revoke all on audit_logs from anon, authenticated;

-- Areas are a harmless controlled vocabulary and are safe to read directly.
grant select on areas to anon, authenticated;

-- ---------------------------------------------------------------------------
-- public_listings — the only public read surface for listing data
-- ---------------------------------------------------------------------------

create view public_listings as
select
  l.id,
  l.slug,
  l.reference_code,
  l.title,
  l.description,
  l.availability_state,
  l.last_confirmed_at,          -- freshness thresholds are applied in application config
  l.available_from,

  -- Money (integer minor units). NULL fee = "not stated", never coerced to zero.
  l.rent_amount_minor,
  l.currency,
  l.rent_frequency,
  l.agency_fee_minor,
  l.legal_fee_minor,
  l.caution_fee_minor,
  l.service_charge_minor,
  l.other_fee_minor,
  l.other_fee_label,
  l.fees_disclosure_state,

  -- Sponsorship must be visible so it can be labelled, never hidden.
  case when l.sponsored_until is not null and l.sponsored_until > now()
       then l.sponsorship_label end as sponsorship_label,

  -- Location: public area + landmark + approximate label only. NO street address.
  a.name  as area_name,
  a.slug  as area_slug,
  p.public_landmark,
  p.approx_location_label,

  p.property_type,
  p.bedrooms,
  p.bathrooms,
  p.toilets,
  p.parking_spaces,
  p.furnishing_state,
  p.water_source,
  p.electricity_meter,
  p.features,
  p.house_rules,

  -- Safe lister summary only.
  lp.public_slug   as lister_slug,
  coalesce(lp.business_name, pr.display_name) as lister_display_name,
  lp.lister_type,

  -- Approved media only, in gallery order.
  coalesce(
    (
      select jsonb_agg(
               jsonb_build_object(
                 'id', m.id,
                 'kind', m.media_type,
                 'storage_path', m.storage_path,
                 'thumbnail_path', m.thumbnail_path,
                 'poster_path', m.poster_path,
                 'alt', coalesce(m.alt_text, ''),
                 'caption', m.caption
               )
               order by m.sort_order, m.created_at
             )
      from listing_media m
      where m.listing_id = l.id
        and m.moderation_state = 'approved'
    ),
    '[]'::jsonb
  ) as media,

  -- Only valid badges: active, not revoked, not expired. Evidence is never exposed.
  coalesce(
    (
      select jsonb_agg(distinct v.verification_type)
      from verification_records v
      where v.subject_type = 'profile'
        and v.subject_id = pr.id
        and v.status = 'active'
        and v.revoked_at is null
        and (v.expires_at is null or v.expires_at > now())
    ),
    '[]'::jsonb
  ) as lister_badges

from listings l
join properties p       on p.id  = l.property_id
join areas a            on a.id  = p.area_id
join profiles pr        on pr.id = p.assigned_lister_id
join lister_profiles lp on lp.profile_id = pr.id
-- Unapproved listings are never public (acceptance A3).
where l.workflow_state = 'approved';

comment on view public_listings is
  'Safe public projection. Excludes private address, evidence paths, raw phone, '
  'internal notes, workflow state, and unapproved media. Public reads must use this view.';

grant select on public_listings to anon, authenticated;
