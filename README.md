# RPG Alliance

Naruto-inspired RPG web app built with Next.js and Supabase.

The app includes:

- Public landing page at /
- Authentication and signup flow
- Approval gate for new users (PENDING, APPROVED, REJECTED)
- Role-based access (MEMBER, KAGE)
- Profile management for RPG identity fields
- Jutsu catalog with filters and detail pages
- Jutsu CRUD API (public read, KAGE write)

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- Supabase Auth + Postgres + RLS

## Main Routes

Public/Auth:

- / (landing page)
- /auth/login
- /auth/sign-up
- /auth/forgot-password
- /auth/update-password
- /auth/confirm
- /auth/sign-up-success
- /auth/error

Protected:

- /pending (users waiting for approval)
- /dashboard (jutsu list + filters)
- /dashboard/jutsus/[id] (jutsu detail)
- /dashboard/profile (profile settings)
- /dashboard/updates (updates feed)
- /dashboard/approvals (KAGE only)

API:

- /api/jutsus (GET public, POST KAGE)
- /api/jutsus/[id] (GET public, PUT/PATCH/DELETE KAGE)

## Access and Approval Model

- New users are created as:
  - role: MEMBER
  - approval_status: PENDING
- Non-approved users are redirected to /pending.
- APPROVED users can access /dashboard.
- Only KAGE users can access /dashboard/approvals and perform write operations on jutsus API.

## Database and Migrations

Migration files are in lib/supabase/migrations:

1. auth-and-roles.sql

- Creates profiles table, role and approval guards, RLS policies, and triggers.

2. 02_rpg_expansion.sql

- Adds RPG profile fields and jutsu/update model expansion.

3. 03_jutsu_model_alignment.sql

- Aligns jutsu schema to current app model.

4. 05_jutsus_public_get.sql

- Allows anonymous/public SELECT on jutsus for GET endpoints.

### Important setup note

After creating your Supabase project, run all migration SQL files in order.

If no KAGE exists yet, promote one user manually in SQL (example in auth-and-roles.sql comments).

## Environment Variables

Create .env.local with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
```

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## Current UX Theme

The interface uses a custom RPG palette:

- Primary red: #9b2230
- Accent orange: #ed7138
- Highlight yellow: #e2e11e
- Neutral gray: #bfc0b9
- Black: #000000

## Project Structure (high level)

- app/: routes, pages, API handlers
- components/: UI and feature components
- lib/access-control.ts: auth and RBAC guards
- lib/jutsus/: filter parsing and normalization helpers
- lib/supabase/: clients, proxy/session, migrations
- data/: local mock data (legacy/support)

## Notes

- Middleware/proxy keeps protected pages behind auth.
- API jutsu GET routes are intentionally public to support server-side loading where needed.
- Role checks are enforced both in app logic and Supabase RLS/policies.
