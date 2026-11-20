# Login – Design

> **This file answers:** How is the app put together? (data, rules, screens,
> where the code lives)
> **Who:** The AI drafts it. You review all of it.
>
> If this file and the requirements disagree, fix the requirements first,
> then this file.

This design covers the login module only — see `01-requirements.md`.
Leave request tables and screens come in the next spec.

## 1. Tables

Three tables for now: the people who can log in, and the two fixed
choice lists their accounts point at. Every row gets an `id`
automatically.

### `User` – one row per person who can log in

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the row |
| `name` | text | yes | Full name, e.g. "Employee 1" |
| `icNo` | text | yes, unique | Identity card number, format `xx-xxxxxx` (two digits, hyphen, six digits) |
| `email` | text | yes, unique | Work email; always ends `@budiman.com`; this is the login username |
| `password` | text | yes | bcrypt hash of the password, never plain text |
| `role` | text | yes | One of `Employee`, `Supervisor`, `HR`, `Admin` (one role per user). Stored as text — SQLite has no enum type; the allowed values live in code and in Reference A |
| `division` | relation → `Division` | yes | The division the user belongs to; used later to pick a supervisor |
| `designation` | text | yes | Job title; must be one of the designations of the user's division |
| `createdAt` | date | auto | Set by the seed / create code |

### `Division` – one row per division

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the row |
| `name` | text | yes, unique | Division name — see Reference A for the four fixed names |

### `Designation` – one row per job title

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the row |
| `name` | text | yes | Job title, e.g. "Finance Manager" |
| `division` | relation → `Division` | yes | Which division offers this job title |

There is **no session table**: the session lives in the signed cookie
only (brief §7.1, "Signed session cookie"). Signing uses Node's
built-in `node:crypto` HMAC — no new packages.

## 2. Business rules

1. **Login is by work email.** The login form checks that the email
   ends with `@budiman.com` before submitting, and the server action
   checks it again. Wrong format = "Only @budiman.com emails can
   log in."
2. **One generic failure message.** Unknown email and wrong password
   both return "Invalid email or password". The app never says which
   one was wrong, and there is no lockout (requirements U5, AC-04).
3. **Passwords are bcrypt hashes.** Verified with `bcryptjs`
   (`bcrypt.compare`). Nothing ever writes a plain-text password.
4. **A valid login sets one cookie.** The server signs
   `{userId, role, expiresAt}` with `SESSION_SECRET` and sets the
   `session` cookie: HttpOnly, SameSite=Lax, Secure, path `/`,
   expires in 8 hours. No refresh — when it dies, the user logs in
   again (U8).
5. **The cookie is the door key, the database is the truth.** Page
   checks re-read the user from the database and use the **database**
   role, not the cookie role. The cookie role is only used by the
   proxy for quick redirects. A tampered or expired cookie fails the
   signature check and is treated as signed out.
6. **Signed out means nothing opens.** Every page except `/login`
   calls `verifySession()`; no session → sent to `/login`. The proxy
   also redirects early so users never see protected content flash.
7. **Your role decides your pages.** `/employee` opens for Employees
   only, `/supervisor` for Supervisors only, `/hr` for HR only,
   `/admin` for Admin only. A logged-in user who asks for another
   role's page is redirected to **their own** home (matches AC-02's
   first option).
8. **Signed in skips the login page.** A logged-in user who opens
   `/` or `/login` goes straight to their role home — this is how
   AC-10 is met; there is never a second live session.
9. **Logout clears the cookie.** The Sign out button in the header
   calls a server action that deletes the `session` cookie and
   redirects to `/login` (U7, AC-06).
10. **Accounts come from the seed only.** No sign-up screen exists
    (requirements §5). The seed is idempotent: running it twice does
    not duplicate users, divisions, or designations.

## 3. Technology

The stack is fixed by the brief §7.1 and `package.json` — nothing new
is installed.

| Part | Choice | In plain words |
|------|--------|----------------|
| Framework | Next.js 16 (App Router) + TypeScript | Pages and server logic in one project |
| Forms | Server actions + `useActionState` | The login form posts to a server action; errors come back as state, no API route |
| Session | Signed cookie, HMAC-SHA256 from `node:crypto` | Tamper-proof without extra packages — jose/iron-session are *not* in `package.json` and AGENTS.md forbids adding packages unasked |
| Passwords | `bcryptjs` | Hash on seed, compare on login |
| Database | SQLite file (`dev.db`) via Prisma | One file, no server |
| Route guard | `src/proxy.ts` | Next 16 renamed `middleware` to `proxy` (see docs in `node_modules/next/dist/docs/…/middleware.md`); does the optimistic cookie check and redirects |
| Access check | DAL: `verifySession()` in `src/lib/dal.ts` | The secure check, called by every page and every action — this is the line of defence; the proxy is only the first filter |

## 4. Screens (routes)

| Route | Who | What it shows | Status |
|-------|-----|---------------|--------|
| `/` | Logged in | Nothing of its own: redirects to the user's role home, or to `/login` if signed out | To do |
| `/login` | Signed out | Email + password form, "Invalid email or password" / "Only @budiman.com emails can log in" errors, a list of the demo accounts as a hint | To do |
| `/employee` | Employee | Placeholder home: the user's name and role, and a note that leave screens come next | To do |
| `/supervisor` | Supervisor | Same placeholder for supervisors | To do |
| `/hr` | HR | Same placeholder for HR officers | To do |
| `/admin` | Admin | Same placeholder for the admin | To do |

Every protected page shares one header (name + role badge + Sign out
button). The header is rendered by a shared component used by each
role page — not by a root layout that hides pages (the Next docs warn
that layouts don't re-render on navigation, so they are not a
security layer).

The current starter `src/app/page.tsx` (hello page) is replaced by
the redirect rule in row 1.

## 5. Where the code lives

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | `User`, `Division`, `Designation` models; SQLite datasource (`DATABASE_URL`) |
| `prisma/seed.ts` | Divisions + designations from Reference A, the six demo users from Reference B, passwords hashed with bcryptjs; idempotent; run with `tsx` |
| `package.json` | One addition: `"prisma": { "seed": "tsx prisma/seed.ts" }` so `prisma db seed` works. No new dependencies |
| `.env` | `DATABASE_URL="file:./dev.db"`, `SESSION_SECRET` (generated once with `openssl rand -base64 32`, never committed; `.env` stays in `.gitignore`) |
| `.env.example` | Same keys with placeholder values, committed, so a fresh clone knows what to set |
| `src/lib/session.ts` | `server-only`. Sign/verify the cookie with `node:crypto` HMAC; `createSession(userId, role)`, `verifySessionToken()`, `deleteSession()`; cookie options per rule 4 |
| `src/lib/dal.ts` | `server-only`. `verifySession()` — valid session + user in DB or redirect to `/login`; `getSessionUser()` returns id, name, role; `requireRole(role)` for role checks |
| `src/app/actions/auth.ts` | Server actions: `login()` — validate fields, find user, `bcrypt.compare`, `createSession`, `redirect(homeFor(role))`; `logout()` — `deleteSession`, `redirect('/login')` |
| `src/app/login/page.tsx` | Login page (server component) |
| `src/app/login/login-form.tsx` | Client component: the `<form>` with `useActionState`, shows the error text from the action |
| `src/app/employee/page.tsx` | `verifySession()` + `requireRole('Employee')`, placeholder content |
| `src/app/supervisor/page.tsx` | Same, `requireRole('Supervisor')` |
| `src/app/hr/page.tsx` | Same, `requireRole('HR')` |
| `src/app/admin/page.tsx` | Same, `requireRole('Admin')` |
| `src/app/ui/header.tsx` | Shared header: name, role, Sign out button (form → `logout` action) |
| `src/app/page.tsx` | Replaced: signed in → role home; signed out → `/login` |
| `src/proxy.ts` | Optimistic check only (reads the cookie, no database): no valid session + protected route → `/login`; valid session + `/login` or `/` → role home from the cookie; valid session + wrong role's route → own home |
| `src/lib/roles.ts` | The four role names and the `homeFor(role)` map, shared by proxy, pages, and actions |

Two layers, on purpose: the proxy gives fast redirects, but every
page and action checks again on its own, because the proxy can be
bypassed by direct action calls and never touches the database.

## 6. Security (in plain words)

- **Every protected page** calls `verifySession()` first: cookie
  signature must be valid, expiry must be in the future, and the user
  must still exist in the database. Fail → `/login` (401 in spirit).
- **Every action checks again.** `logout()` requires a session;
  later write actions will call `requireRole` server-side — client
  restrictions are never the security.
- **No secrets on the client.** Passwords go only into the server
  action; the cookie payload holds `userId`, `role`, `expiresAt` and
  nothing else — no name, no IC, no password material.
- **The cookie is set by the server** with HttpOnly (no JavaScript
  can read it), SameSite=Lax (cross-site POSTs don't carry it — the
  main CSRF guard), Secure, path `/`, 8-hour expiry.
- **`SESSION_SECRET` lives in `.env`**, which is gitignored. Without
  it the app refuses to start rather than signing with an empty key.
- **Passwords**: bcrypt with the default cost (10); the database file
  holds hashes only (AC-09). The demo password is demo-only.
- **Generic errors**: "Invalid email or password" for every credential
  failure — unknown email and wrong password are indistinguishable
  (OWASP A07/A05, requirements U5).
- **No auth libraries**: the guide recommends jose/iron-session, but
  they are not in the pinned `package.json`; `node:crypto` HMAC covers
  our needs with zero new packages.

## 7. Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install the pinned dependencies |
| `cp .env.example .env` then fill `SESSION_SECRET` from `openssl rand -base64 32` | One-time setup of the database path and signing key |
| `npx prisma db push` | Create/update `dev.db` from `schema.prisma` |
| `npx prisma db seed` | Load divisions, designations, and the six demo users (AC-05) |
| `npm run dev` | Start the app at http://localhost:3000 |
| `npx prisma studio` | Look at the tables — and check the password column holds hashes (AC-09) |

---

# Reference

> Long lists you look things up in (fixed choices, demo data). Keep them here
> so the rules above stay short.

## Reference A. Fixed lists

- **Roles (stored as text, exactly these four):** Employee,
  Supervisor, HR, Admin
- **Home per role:** Employee → `/employee`, Supervisor →
  `/supervisor`, HR → `/hr`, Admin → `/admin`
- **Divisions and their designations (brief §7.2):**
  - Finance: Finance Manager, Accountant, Accounts Clerk
  - Human Resources: HR Manager, HR Officer, HR Assistant
  - Information Technology: IT Manager, Software Developer, IT Support Officer
  - Operations: Operations Manager, Operations Supervisor, Operations Executive
  - Marketing: Marketing Manager, Marketing Executive, Marketing Assistant
- **Email rule:** ends with `@budiman.com`, unique per user
- **IC rule:** `xx-xxxxxx` (2 digits, hyphen, 6 digits), unique
- **Session:** cookie name `session`, 8-hour expiry, no refresh

## Reference B. Demo data (seeded by `prisma/seed.ts`)

All six accounts use the password `password123`, stored as a bcrypt
hash. Names and IC numbers are made up (brief §7.2).

| Email | Name | IC No. | Role | Division | Designation |
|-------|------|--------|------|----------|-------------|
| employee-1@budiman.com | Employee 1 | 00-148888 | Employee | Finance | Accounts Clerk |
| supervisor-1@budiman.com | Supervisor 1 | 00-157777 | Supervisor | Finance | Finance Manager |
| supervisor-2@budiman.com | Supervisor 2 | 00-166666 | Supervisor | Finance | Accountant |
| hr-1@budiman.com | HR 1 | 00-175555 | HR | Human Resources | HR Officer |
| hr-2@budiman.com | HR 2 | 00-184444 | HR | Human Resources | HR Officer |
| admin@budiman.com | Admin | 00-193333 | Admin | Admin* | Admin Manager |

\* The brief has no "Admin" division in the fixed list; the seed adds
it as a fifth division so the admin's division field can be filled.
Confirm with the HR Manager.
