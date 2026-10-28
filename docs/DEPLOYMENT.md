# Deployment (Milestone 7)

JosHomes is a standard Next.js (App Router) app and deploys to any Node host;
Vercel is the least-effort target. This guide covers a controlled pilot deploy.

> **Status.** The app currently runs on in-memory development backends. A real
> pilot MUST be pointed at Supabase (below). Provisioning Supabase and verifying
> row-level security against a live database is the outstanding pre-pilot item
> (decision D-022) and cannot be done from the build environment.

## 1. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical origin for metadata, robots, sitemap (e.g. `https://joshomes.ng`). |
| `SESSION_SECRET` | prod | 32+ random chars; signs the session cookie. App refuses to start in prod without it. |
| `NEXT_PUBLIC_SUPABASE_URL` | pilot | Supabase project URL — switches data + auth to the DB. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pilot | Supabase anon key (RLS-governed). |
| `SUPABASE_SERVICE_ROLE_KEY` | pilot | Server-only; bypasses RLS for trusted server code. Never expose to the browser. |
| `JOSHOMES_ALLOW_INDEXING` | opt | `true` only for the real public pilot; otherwise the site is `noindex` and `robots` disallows all. |
| `JOSHOMES_ALLOW_DEV_AUTH` | never in prod | Enables the in-memory mock auth in a non-public demo only. |

Generate a session secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

## 2. Secrets checklist (acceptance L4)

- [ ] No `.env`, `.env.local`, or key material is committed (`.gitignore` covers them).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only as a server env var, never `NEXT_PUBLIC_`.
- [ ] `SESSION_SECRET` is unique per environment and stored in the host's secret manager.
- [ ] `JOSHOMES_ALLOW_DEV_AUTH` is unset (or false) in production.
- [ ] Repository history contains no live credentials (`git log -p | grep -i key` sanity check).

## 3. Provision Supabase (closes D-022)

1. Create a Supabase project; copy the URL, anon key, and service-role key.
2. Apply migrations in order, then the seed:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_public_view.sql`
   - `supabase/migrations/0003_rls.sql`
   - `supabase/seed.sql`
   (Supabase CLI: `supabase db push`; or paste each file into the SQL editor in order.)
3. Create a public Storage bucket for listing media and a **private** bucket for
   verification evidence (M3 storage abstraction maps to these).
4. Set the env vars from §1 and redeploy.
5. **Verify RLS live** (the D-022 gap) before opening the pilot:
   - Sign in as two different listers; confirm one cannot read or edit the other's rows.
   - Confirm a lister cannot set `workflow_state='approved'`.
   - Confirm an anonymous query on `public_listings` cannot return `private_address_line`.

## 4. Deploy to Vercel

1. Import the repository in Vercel (framework auto-detected as Next.js).
2. Add the env vars from §1 (Production + Preview as appropriate).
3. Deploy. Vercel runs `next build` and serves the App Router + server actions.
4. Confirm `GET /api/health` returns `{"status":"ok","dataBackend":"supabase","auth":"supabase"}`.

Netlify works too (via its Next runtime); Vercel is simpler for server actions.

## 5. Go-live checks

- [ ] `GET /api/health` reports the Supabase backends (not `dev`).
- [ ] `GET /robots.txt` and `GET /sitemap.xml` reflect the intended indexing state.
- [ ] A guest can search and open a listing; a lister can submit; staff can moderate.
- [ ] Private address / verification evidence absent from all public payloads (spot-check + the automated A5/H4 tests).
- [ ] Error monitoring provider wired into `src/lib/observability/logger.ts` `captureError`.
