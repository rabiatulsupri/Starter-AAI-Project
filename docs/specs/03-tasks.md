# Login – Tasks

> **This file answers:** In what order do we build it, and how do we check each step?
> **Who:** The AI drafts it. You review it.
>
> Build one task at a time, in order. When a task is done, the AI changes its
> Status to Done. At the end, you check the whole app against the specs.
> If something is wrong, fix the spec first, then ask the AI to rebuild.

**Priority.** Every task is **High**, **Medium** or **Low**. Do High first.
Do Low only if time is left, and only if you ask.

Order follows the brief §8 (login first, High first) and AGENTS.md (one
small task at a time, one conventional commit each, e.g.
`feat: add login form`). The database comes first, then the login
flow is built outward: form → real sign-in → page locks → early
redirects → header → full pass. Task 6 is Medium only because the
High checks behind it (AC-02/AC-03) already pass by Task 5 — the
proxy is a second layer, not the only defence.

| Status | # | Task | Priority | Checks (from requirements §4) |
|--------|---|------|----------|-------------------------------|
| To do | 1 | Set up the database and the users table | High | enables AC-05, AC-09 |
| To do | 2 | Seed the divisions, designations and demo users | High | AC-05, AC-09 |
| To do | 3 | Login page, form and validation | High | AC-04, AC-08 |
| To do | 4 | Sign in for real: credentials, session, role homes | High | AC-01 (part), AC-10 (part) |
| To do | 5 | Lock every page behind the session check | High | AC-02, AC-03, AC-07 |
| To do | 6 | Early redirects with the proxy | Medium | AC-02, AC-10 |
| To do | 7 | Header with the Sign out button | High | AC-06, AC-01 (header) |
| To do | 8 | Full pass of the acceptance checklist | High | AC-01 … AC-10 |

---

## Task 1 – Set up the database and the users table *(High)*

> From design §1 and §5. The app has no tables yet — nothing else
> works until this does.

- **Goal:** A SQLite database exists with the `User`, `Division` and
  `Designation` tables as designed, reachable from Prisma.
- **Files:** `.env` (with `DATABASE_URL` and `SESSION_SECRET`),
  `.env.example`, `prisma/schema.prisma`.
- **Check:**
  • Create `.env` and `.env.example` per design §7; `.env` must not
    show up in `git status`
  • Run `npx prisma db push` — it should report the schema is in sync
    and create `prisma/dev.db`
  • Run `npx prisma studio`, open the User table — it should be empty,
    with columns name, icNo, email, password, role, divisionId,
    designation, createdAt
  • Try inserting two rows with the same email in Studio — the second
    must be refused (email is unique; same for icNo)

## Task 2 – Seed the divisions, designations and demo users *(High)*

> From design §5 (`prisma/seed.ts`) and Reference A/B. This is the
> brief's "demo people" step — after it, everyone has the same
> logins.

- **Goal:** One command loads the four divisions (plus Admin), all
  designations, and the six demo users with bcrypt-hashed
  `password123`.
- **Files:** `prisma/seed.ts`; `package.json` gets only the
  `"prisma": { "seed": "tsx prisma/seed.ts" }` block (no new
  packages).
- **Check (AC-05, AC-09):**
  • Run `npx prisma db seed`
  • In Studio: 5 divisions, their designations, and the six users of
    Reference B with correct role, division and designation
  • Look at the password column — every value starts `$2a$` or
    `$2b$`; searching the `dev.db` file for `password123` must find
    nothing
  • Run `npx prisma db seed` again — still exactly six users
    (idempotent)

## Task 3 – Login page, form and validation *(High)*

> From design §4 (`/login`) and rules 1–2. The form posts to a server
> action; at this stage the action only validates — it always shows
> the generic error. Real credential checking is Task 4.

- **Goal:** `/login` shows email + password fields; a bad email
  format is blocked in the browser, and everything else comes back as
  "Invalid email or password".
- **Files:** `src/app/login/page.tsx`, `src/app/login/login-form.tsx`,
  `src/app/actions/auth.ts` (login part), `src/lib/roles.ts`.
- **Check (AC-04, AC-08):**
  • Run `npm run dev`, open http://localhost:3000/login
  • Enter `someone@gmail.com` + any password → the form refuses to
    submit with "Only @budiman.com emails can log in", without a
    server round-trip
  • Turn off JavaScript (DevTools → Settings → Debugger), submit the
    same email → the server action shows the same message (rule 1's
    second check)
  • Enter `admin@budiman.com` + `wrongpass` → "Invalid email or
    password", still on `/login`
  • Enter `nobody@budiman.com` + `password123` → the **exact same**
    message as the previous step (AC-04's core)

## Task 4 – Sign in for real: credentials, session, role homes *(High)*

> From design rules 3–4 and §5. Adds the session helpers, real
> `bcrypt.compare`, and the four role home pages. Pages are still
> unprotected — anyone can open them directly; Task 5 fixes that.

- **Goal:** Correct credentials create the signed 8-hour cookie and
  land the user on their own role home showing their name.
- **Files:** `src/lib/session.ts`, `src/lib/roles.ts` (extend),
  `src/app/actions/auth.ts` (fill in real check + `createSession` +
  `redirect`), `src/app/employee/page.tsx`,
  `src/app/supervisor/page.tsx`, `src/app/hr/page.tsx`,
  `src/app/admin/page.tsx`.
- **Check (AC-01 part):**
  • Sign in as employee-1@budiman.com / password123 → you land on
    `/employee` and see "Employee 1"
  • Repeat with supervisor-1 (→ `/supervisor`), hr-1 (→ `/hr`),
    admin (→ `/admin`)
  • In DevTools → Application → Cookies: a `session` cookie that is
    HttpOnly, SameSite=Lax, Secure, path `/`, expires in ~8 hours
  • Edit one character of the cookie value and reload `/employee` →
    the tampered cookie is rejected (generic error / back to login
    once Task 5 lands); it must never crash the page
  • Wrong password still shows the Task 3 generic error

## Task 5 – Lock every page behind the session check *(High)*

> From design rule 5–7 and the DAL in §5. The secure layer: pages and
> the root route check the session against the database themselves.

- **Goal:** No protected page renders without a valid session, and
  the wrong role never sees another role's home.
- **Files:** `src/lib/dal.ts`; edit the four role pages to call
  `verifySession()` + `requireRole(...)` at the top; `src/app/page.tsx`
  becomes the redirect of design §4 row 1.
- **Check (AC-02, AC-03, AC-07):**
  • Open a private window, go straight to `/employee` → you see
    `/login`, no employee content
  • Same for `/supervisor`, `/hr`, `/admin`
  • Sign in as employee-1, type `/admin` → you land on `/employee`
    (your own home, per AC-02); try `/hr` and `/supervisor` too
  • Sign in as admin, try the other three role routes → land on
    `/admin`
  • Sign in, edit the `session` cookie's expiry to a past date in
    DevTools, navigate to `/employee` → back to `/login`; signing in
    again works (AC-07)
  • Go to `/` while signed in → your role home; while signed out →
    `/login`

## Task 6 – Early redirects with the proxy *(Medium)*

> From design §5 (`src/proxy.ts`) and rule 8. Cookie-only checks, no
> database — the fast first layer under Task 5's secure checks.

- **Goal:** Users are redirected before protected content ever
  renders, and a signed-in user never sees the login page.
- **Files:** `src/proxy.ts`.
- **Check (AC-02, AC-10):**
  • Sign in as employee-1, open `/login` → you go straight to
    `/employee` (AC-10); submit `/login` again → still `/employee`,
    only one live session
  • Sign in as employee-1, type `/admin` → redirected with no flash
    of admin content (Task 5 already blocks it; this makes it
    instant)
  • Sign out, type `/employee` → `/login` immediately
  • Slow the network (DevTools → Network → Slow 3G) and repeat the
    `/admin` try — no protected content paints before the redirect

## Task 7 – Header with the Sign out button *(High)*

> From design rule 9 and `src/app/ui/header.tsx`. The header is shared
> UI, not a security layer — the checks stay where they are.

- **Goal:** Every role page shows the user's name, role, and a Sign
  out button; signing out ends the session and returns to `/login`.
- **Files:** `src/app/ui/header.tsx`; edit the four role pages to
  render it; `src/app/actions/auth.ts` gets the `logout` action.
- **Check (AC-06, AC-01 header part):**
  • Sign in as hr-2@budiman.com → the header on `/hr` shows "HR 2",
    the HR role, and a Sign out button
  • Click Sign out → you land on `/login`
  • Press the browser Back button, and type `/hr` directly → both
    send you back to `/login`, never the HR home
  • Check the header appears the same on all four role homes

## Task 8 – Full pass of the acceptance checklist *(High)*

> The brief §8 step 6 "Check": the whole login module against
> requirements §4, from a clean start.

- **Goal:** Every AC in requirements §4 is ticked Done with you
  watching, so the module is ready to hand over.
- **Files:** none new — `docs/specs/01-requirements.md` §4 is marked
  up as you test.
- **Check (AC-01 … AC-10):**
  • Delete `prisma/dev.db`, run `npx prisma db push` then
    `npx prisma db seed` (a clean start anyone can repeat)
  • Walk the AC table top to bottom: all six demo accounts sign in to
    their own home (AC-01), wrong credentials are indistinguishable
    (AC-04), sign out works from every role (AC-06), session expiry
    (AC-07), email suffix (AC-08), hashed passwords in the raw file
    (AC-09), login page while signed in (AC-10)
  • Tick each AC to Done in `01-requirements.md`; if one fails, fix
    the spec first, then the code — before ticking it
