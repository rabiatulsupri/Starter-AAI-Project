# Login – Tasks

> **In what order, and how to check.** Build one task at a time, in order.
> After each task: the AI builds it → a reviewer agent tests it → **you check it
> in the browser**.
>
> If a check fails, **fix the spec first** (requirements or design), then ask
> the AI to rebuild. The requirements and design are the source of truth.
>
> These tasks are **already done** in the starter app – they show what a task
> list looks like. In Session 2, add the Leave Request tasks after Task 6.

**Core and Stretch.** **Core** tasks must be finished first: the app is not
usable without them. **Stretch** tasks are nice extras. Do them only if time is
left, and only if you ask for them. All the login tasks are Core, because login
has to work before anything else.

**Before you start:** `npm install`, then `cp .env.example .env`
(Windows: `copy .env.example .env`).

| # | Task | Core / Stretch | Checks (from requirements §4) |
|---|------|----------------|-------------------------------|
| 1 | Set up the app | Core | – |
| 2 | Database table and demo users | Core | – |
| 3 | Log in and log out | Core | AC-01, AC-02, AC-03, AC-06 |
| 4 | Role protection and home pages | Core | AC-04, AC-05, AC-07 |
| 5 | Top bar | Core | AC-08, AC-09 |
| 6 | Final check and README | Core | All |

---

## Task 1 – Set up the app *(Core)*

- **Goal:** A Next.js + TypeScript app with Tailwind CSS that starts.
- **Files:** `package.json`, `next.config.ts`, `tsconfig.json`,
  `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  (starts with `@import "tailwindcss";` – no Tailwind config file needed).
- **Check:** `npm run dev` starts, and http://localhost:3000 shows a page.

## Task 2 – Database table and demo users *(Core)*

- **Goal:** Prisma with SQLite, the `User` table from design Part A, and the
  demo users from design §6 with hashed passwords.
- **Files:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`,
  `src/lib/db.ts`, `src/lib/constants.ts`, `.env.example`, the `db:seed`
  script in `package.json`.
- **Check:** `npm run db:migrate` creates `prisma/dev.db`. `npm run db:seed`
  prints the 7 demo users, and `npm run db:studio` shows them.

## Task 3 – Log in and log out *(Core)*

- **Goal:** Login page, signed session cookie, and logout with a confirmation
  box. After login, go to the role's home page.
- **Files:** `src/lib/auth.ts` (`getCurrentUser`, `startSession`, `endSession`,
  `roleHome`), `src/app/actions.ts` (`loginAction`, `logoutAction`),
  `src/app/login/page.tsx`, `src/components/LoginForm.tsx`,
  `src/components/LogoutButton.tsx`, `src/components/ui/` (Button, Field,
  dialogs).
- **Check:** AC-01, AC-02, AC-03, AC-06.

## Task 4 – Role protection and home pages *(Core)*

- **Goal:** A `requireRole(...)` helper used at the top of every page, so each
  role sees only its own screens, and a home page for each role with only a short hint line.
- **Files:** `src/lib/auth.ts`, `src/app/employee/page.tsx`,
  `src/app/supervisor/page.tsx`, `src/app/hr/page.tsx`,
  `src/app/admin/page.tsx`.
- **Check:** AC-04, AC-05, AC-07.

## Task 5 – Top bar *(Core)*

- **Goal:** The top bar from design §4 (app name, who is logged in, **Log
  out**), and the **Not found** page.
- **Files:** `src/components/AppShell.tsx`, `src/components/LogoutButton.tsx`,
  `src/components/ui/`, `src/app/not-found.tsx`.
- **Check:** AC-08, AC-09.

## Task 6 – Final check and README *(Core)*

- **Goal:** Run `npm run db:seed`, then walk through the whole acceptance
  checklist as each role. Make sure `README.md` explains how to install, run
  and test.
- **Check:** Every AC box ticked; `npm run lint` and `npm run build` pass.

---

# Leave Request – Tasks

> Same rules as the login tasks above: build **one task at a time**, in
> order; the AI builds → a reviewer agent tests → **you check it in the
> browser**. If a check fails, fix the spec first, then rebuild.
>
> **All eight tasks are Core** (Assumption A7): the brief's flow
> employee → supervisor → HR → admin does not work without any of them.
> Nothing in this module is Stretch.

**Before you start:** Tasks 1–6 are already done; `npm run db:seed` still
means clean data before every check.

| # | Task | Core / Stretch | Checks (from requirements §4) |
|---|------|----------------|-------------------------------|
| 7 | Leave data model and demo requests | Core | – |
| 8 | Employee home: own lists | Core | AC-15 |
| 9 | New leave request form | Core | AC-10, AC-11, AC-12, AC-13, AC-14 |
| 10 | Employee detail and Send to HR | Core | AC-18, AC-19, AC-23 |
| 11 | Supervisor decides | Core | AC-16, AC-17, AC-18 |
| 12 | HR shared queue and decision | Core | AC-20, AC-21, AC-22 |
| 13 | Admin read-only view | Core | AC-24 |
| 14 | Server-side enforcement and final walkthrough | Core | AC-25, then all |

---

## Task 7 – Leave data model and demo requests *(Core)*

- **Goal:** The `LeaveRequest` table from design Part A §1, the leave-type
  and status constants, and the 8 demo requests from design Part B §6.
- **Files:** `prisma/schema.prisma`, a new migration in `prisma/migrations/`,
  `prisma/seed.ts`, `src/lib/constants.ts`.
- **Check:** `npm run db:migrate` creates the table; `npm run db:seed` prints
  the 7 users and 8 requests; `npm run db:studio` shows rows covering all
  five statuses, including one Signed and both rejection kinds.

## Task 8 – Employee home: own lists *(Core)*

- **Goal:** `/employee` becomes the home page from design Part B §5: the
  employee's own to-act list on top, history below, A8 columns, status
  badges, empty states, and a **New leave request** button.
- **Files:** `src/lib/leave.ts` (list for a user), `src/components/leave/`
  (`LeaveTable`, `StatusBadge`), `src/app/employee/page.tsx`.
- **Check:** AC-15. After `npm run db:seed`, `employee-1` sees exactly their
  5 requests with the right statuses and columns; nothing of `employee-2`
  appears. `npm run lint` passes.

## Task 9 – New leave request form *(Core)*

- **Goal:** `/employee/leave/new` with type/dates/reason fields, a
  division-supervisor dropdown, end-before-start and empty-field validation,
  the calendar-days figure shown, confirm + success on submit, and the
  blocked message when the division has no supervisor.
- **Files:** `src/app/employee/leave/new/page.tsx`,
  `src/components/leave/LeaveForm.tsx`, `src/app/actions.ts`
  (create action), `src/lib/leave.ts` (supervisors of a division),
  `src/lib/constants.ts` (days helper).
- **Check:** AC-10, AC-11, AC-12, AC-13, AC-14 (including the Prisma Studio
  division change, then `npm run db:seed` to restore).

## Task 10 – Employee detail and Send to HR *(Core)*

- **Goal:** `/employee/leave/[id]` shows one own request with status,
  remarks and decider; **Send to HR** appears only on a *Signed* request
  (confirm → success → *With HR*); no edit, cancel or reopen anywhere;
  foreign ids give Not found.
- **Files:** `src/app/employee/leave/[id]/page.tsx`,
  `src/components/leave/LeaveDetail.tsx` (uses `DetailSection`),
  `src/components/leave/LeaveActions`, `src/app/actions.ts`
  (send-to-HR action).
- **Check:** AC-18 (the remark on seeded request 5 is visible to
  `employee-1`), AC-19 (seeded Signed request 2 goes to the HR queue; no
  button on the others), AC-23 (rejected request 5 is inert; a fresh
  request still works). As `employee-2`, open request 1's URL → Not found.

## Task 11 – Supervisor decides *(Core)*

- **Goal:** `/supervisor` home with the to-act list of their `SUBMITTED`
  requests and history below; `/supervisor/leave/[id]` with **Sign** and
  **Reject** – reject requires a remark – each with confirm and success;
  the employee sees the new status and remark.
- **Files:** `src/app/supervisor/page.tsx`,
  `src/app/supervisor/leave/[id]/page.tsx`,
  `src/components/leave/DecideDialog.tsx`, `src/app/actions.ts`
  (sign, reject actions).
- **Check:** AC-16, AC-17, AC-18 (supervisor side). As `supervisor-2`,
  `supervisor-1`'s requests are not listed and their URL gives Not found.

## Task 12 – HR shared queue and decision *(Core)*

- **Goal:** `/hr` home with the shared queue – every `WITH_HR` request from
  every division – plus full history; `/hr/leave/[id]` with **Approve** and
  **Reject** (remark required); the deciding officer and date are recorded
  and shown.
- **Files:** `src/app/hr/page.tsx`, `src/app/hr/leave/[id]/page.tsx`,
  `src/app/actions.ts` (approve action; HR branch of reject).
- **Check:** AC-20, AC-21, AC-22.

## Task 13 – Admin read-only view *(Core)*

- **Goal:** `/admin` lists every request in the system; `/admin/leave/[id]`
  shows status, remarks and decider with **no** action buttons anywhere.
- **Files:** `src/app/admin/page.tsx`, `src/app/admin/leave/[id]/page.tsx`.
- **Check:** AC-24.

## Task 14 – Server-side enforcement and final walkthrough *(Core)*

- **Goal:** The reviewer agent attempts every action (create, sign, reject,
  send, approve) as the wrong role and the wrong status by calling the
  server actions directly; each must be refused with nothing changed.
  Then the full module walkthrough as each role from clean data, and the
  README updated for the demo requests.
- **Files:** `src/lib/leave.ts` and `src/app/actions.ts` (close any gap the
  reviewer finds), `starter-project/README.md`.
- **Check:** AC-25, then every AC-10…AC-25 ticked after `npm run db:seed`,
  `npm run lint` and `npm run build` pass, and the login checks
  AC-01…AC-09 still pass.
