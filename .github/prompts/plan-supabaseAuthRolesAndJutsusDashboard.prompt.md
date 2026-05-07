## Plan: Supabase Auth + Roles + Jutsus Dashboard

Recommended approach: keep authentication simple (email+password and phone+OTP), remove email-confirmation gating, introduce a profiles-based approval workflow controlled by KAGE, and make /protected the JUTSUS cards dashboard using mock JSON with a clean path to Supabase tables later.

### Steps
1. Phase 1: Access model and DB baseline (blocks everything else)
1. Create a profiles model linked to auth.users with role and approval_status fields.
2. Enforce two roles only: KAGE and MEMBER.
3. Enforce approval_status lifecycle: PENDING, APPROVED, REJECTED.
4. Add RLS so users can read their own profile and only KAGE can approve/reject others.

2. Phase 2: Auth flow upgrades (depends on Phase 1)
1. Update signup to support email or phone selector.
2. Email path: sign up with password, no email-confirmation dependency.
3. Phone path: SMS OTP flow.
4. Update login to support email+password or phone+OTP in one UX.
5. Keep forgot password as email-only and only show in email mode.

3. Phase 3: KAGE approval workflow (depends on Phase 1 and 2)
1. New users are created as MEMBER + PENDING.
2. PENDING users can authenticate but are blocked from protected content.
3. Add KAGE dashboard page for pending users with Approve/Reject actions.
4. Protect mutation actions server-side so only KAGE can approve/reject.
5. APPROVED users gain normal protected access.

4. Phase 4: JUTSUS as protected main page (depends on Phase 3 guards)
1. Replace protected landing content with JUTSUS card dashboard at /protected.
2. Add mock JSON data source with stable schema aligned to future Supabase table fields.
3. Render responsive card grid.
4. Role-based filtering: KAGE sees all, MEMBER sees allowed subset.
5. Keep data access abstract so swapping JSON to Supabase query is low-friction.

5. Phase 5: Confirmation cleanup and regression safety (parallelizable with Phase 3/4 UI)
1. Remove signup-success email confirmation messaging.
2. Deprecate or simplify confirm route if no longer needed.
3. Keep middleware focused on authentication; apply approval gating in protected logic.
4. Run auth and access regression checks.

### Relevant existing files to modify/reuse
- [components/sign-up-form.tsx](components/sign-up-form.tsx): current handleSignUp flow and redirect behavior.
- [components/login-form.tsx](components/login-form.tsx): current email/password-only login flow.
- [app/protected/page.tsx](app/protected/page.tsx): current protected landing, will become JUTSUS dashboard.
- [app/protected/layout.tsx](app/protected/layout.tsx): nav/layout extension point for KAGE approval entry.
- [lib/supabase/proxy.ts](lib/supabase/proxy.ts): keep auth redirect behavior, avoid mixing approval logic here.
- [app/auth/sign-up-success/page.tsx](app/auth/sign-up-success/page.tsx): remove “confirm email” onboarding copy.
- [app/auth/confirm/route.ts](app/auth/confirm/route.ts): reassess necessity after confirmation removal.
- [lib/supabase/server.ts](lib/supabase/server.ts): add helpers for profile/role/approval checks.

### Supabase changes required (how to do it)
1. Dashboard configuration
1. Authentication → Providers → Email: keep enabled, disable mandatory confirmation behavior.
2. Authentication → Providers → Phone: enable and configure SMS provider.
3. Authentication → URL Configuration: ensure localhost and production redirects are registered.

2. SQL editor changes
1. Create public profiles table with:
- id uuid primary key references auth.users(id)
- role text check (KAGE, MEMBER)
- approval_status text check (PENDING, APPROVED, REJECTED)
- optional display_name, phone, created_at
2. Enable RLS on profiles.
3. Add policies:
- user can read own row
- user can update only allowed self fields
- KAGE can read/update all rows for approval actions
4. Seed first KAGE by updating one existing user profile row to role=KAGE.

### Verification
1. Email signup/login works without email confirmation gate.
2. Phone OTP signup/login works end-to-end.
3. New user defaults to MEMBER + PENDING.
4. PENDING user is blocked from protected content.
5. KAGE can approve/reject; MEMBER cannot access approval actions.
6. /protected renders JUTSUS cards with role-aware filtering.
7. Forgot password still works for email users.

### Decisions captured
1. Phone auth mode: SMS OTP only.
2. Main dashboard target: /protected is JUTSUS page.
3. Approval UX: KAGE pending list with Approve/Reject.
4. Access policy: no email-confirmation gate; approval_status controls protected access.