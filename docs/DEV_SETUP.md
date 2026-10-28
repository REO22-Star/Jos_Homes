# Development setup

JosHomes is a Next.js (App Router) + TypeScript project. It runs in two modes
with no code changes:

- **Default (no configuration):** deterministic fictional in-repo listings +
  in-memory development accounts. Nothing external is required to run, build, or
  test. This is what Milestone 0 shipped and what the tests run against.
- **Supabase-backed:** set the Supabase environment variables (below) and the
  data layer and authentication both switch to a real Postgres project. The
  public projection, authorization rules, and RLS policies then apply.

## Prerequisites

- Node.js 20+ (developed on Node 24).
- npm 10+.

## Install

```bash
npm install
```

## Environment

Milestone 0 needs no environment variables. A documented example lives in
`.env.example`; copy it to `.env.local` if you want to override the public site
name/URL. Never commit real secrets.

```bash
cp .env.example .env.local   # optional
```

## Run the app

```bash
npm run dev      # start the dev server at http://localhost:3000
```

## Quality gates

```bash
npm run format:check   # Prettier formatting
npm run lint           # ESLint (next/core-web-vitals)
npm run typecheck      # tsc --noEmit
npm run test           # Vitest unit + component tests
npm run build          # production build
npm run e2e            # Playwright browser tests (builds is reused via `npm run start`)
```

Notes:

- `npm run e2e` requires the Playwright browser once: `npx playwright install chromium`.
  Its web server runs `npm run start`, so run `npm run build` first (or let a prior
  build be reused).
- All money is stored as integer minor units (kobo). All freshness/availability is
  computed against the current server time via `src/lib/now.ts`.

## Where things live

| Area | Path |
| --- | --- |
| Pure business rules (tested) | `src/lib/domain/` |
| Public projection (privacy boundary) | `src/lib/domain/projection.ts` |
| Fictional data + repository | `src/lib/data/` |
| Design-system primitives | `src/components/ui/` |
| Listing components | `src/components/listing/` |
| Layout / navigation | `src/components/layout/` |
| Pure business rules (tested) | `src/lib/domain/` (incl. `authorization.ts`) |
| Auth layer (providers, session, guards) | `src/lib/auth/` |
| Supabase client (anon + service role) | `src/lib/db/supabase.ts` |
| Database migrations + seed | `supabase/migrations/`, `supabase/seed.sql` |
| Pages (App Router) | `src/app/` (incl. `dashboard/`, `sign-in/`, `sign-up/`) |
| Browser tests | `tests/e2e/` |

## Accounts (default in-memory mode)

With Supabase unset, authentication uses fictional in-memory accounts. Every one
shares the password `joshomes-dev`, and the sign-in page lists them:

| Email | Role |
| --- | --- |
| `grace@example.test` | lister |
| `seeker@example.test` | seeker |
| `mod@example.test` | moderator |
| `admin@example.test` | administrator |

These reset when the server restarts. The mock provider is refused in production
unless `JOSHOMES_ALLOW_DEV_AUTH=true` is set for a non-public demo.

## Milestone 1 — Supabase provisioning (when you're ready)

Live Supabase was **not** reachable in the environment where M1 was built, so the
SQL was authored and the app wired against it, but the policies below have not yet
been executed against a real Postgres instance (see the gap note). To go live:

1. Create a Supabase project. Copy the Project URL, the `anon` public key, and the
   `service_role` secret key.
2. Put them in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # server-only
   SESSION_SECRET=<32+ random chars>
   ```
3. Apply the migrations in order (`supabase/migrations/0001…0003`), then load
   `supabase/seed.sql`. Either use the Supabase CLI (`supabase db push` / `supabase db reset`)
   or paste each file into the SQL editor in order.
4. Restart `npm run dev`. The app now reads listings from the `public_listings`
   view and authenticates via Supabase Auth. No code changes are needed.

### Known verification gap (carry into Milestone 1 review)

The row-level-security policies in `supabase/migrations/0003_rls.sql` are the
database backstop for the authorization rules. They are **mirrored and unit-tested**
in `src/lib/domain/authorization.ts` (application layer), but their **enforcement
inside Postgres has not been executed** because no live/local Postgres was
available at build time. Before pilot, run the RLS suite against a real database:
sign in as two different listers and confirm one cannot read/modify the other's
rows, that a lister cannot set `workflow_state='approved'`, and that a public
(anon) query cannot return `private_address_line`.
