# Login – Design

> **How it is built.** This document turns the requirements into a plan a
> builder (person or AI) can follow without asking the business again.
> [01-requirements.md](01-requirements.md) is the source of truth for
> *behaviour*; if the two disagree, fix the requirements first, then this file.
>
> - **Part A – Data design** (sections 1–2): **you own and review this.**
> - **Part B – App design** (sections 3–8): the AI drafts this; you check it.

---

# Part A – Data design (you review)

## 1. Tables

The app stores data in one table so far. Every row gets a number (`id`)
automatically. In Session 2 you add the leave request table here.

### `User` – one row per person who can log in

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the user |
| `email` | text | yes, unique | Used to log in, stored in lowercase, e.g. `employee-1@budiman.com` |
| `name` | text | yes | Full name shown on screen, with the division in brackets, e.g. "Employee 1 (Finance & Administration)" |
| `passwordHash` | text | yes | Scrambled password – never the real one |
| `role` | text | yes | `EMPLOYEE`, `SUPERVISOR`, `HR` or `ADMIN` |
| `identificationNo` | text | yes | Staff ID: `00-1` then 5 digits, e.g. `00-148291` |
| `designation` | text | yes | Job title, one of the list in rule 4, e.g. `Administrative Officer` |
| `division` | text | yes | Department, one of the list in rule 4, e.g. `Finance & Administration` |
| `createdAt` | date + time | auto | When the user was created |

> **Why is role plain text?** SQLite (our database) does not support a fixed
> list of choices ("enums"). So the allowed values are listed in
> `src/lib/constants.ts`, and the app checks them.

## 2. Business rules

1. **Emails.** Every email is a company address ending in `@budiman.com`. It is
   stored in lowercase and is unique, so login ignores capitals.
2. **Passwords.** Stored only as a hash (bcrypt). A wrong email and a wrong
   password give the **same** message, so nobody can find out which emails exist.
3. **Roles.** Each user has exactly one role. The role decides which pages they
   can open (§4).
4. **Divisions and designations** are chosen from fixed lists, kept in
   `src/lib/constants.ts`:
   - **Division:** Software Development, Quality Assurance, IT Infrastructure &
     Operations, Cybersecurity, Data & Analytics, Product & Design, Customer
     Support, Human Resources, Finance & Administration, Management.
   - **Designation:** Software Engineer, QA Engineer, System Administrator,
     IT Support Technician, Data Analyst, UI/UX Designer, Team Lead, HR Officer,
     Administrative Officer, Director. The designation is only a job title;
     the role decides what someone can do.
5. **Sessions.** A login lasts 7 days on the same browser, then the user must
   log in again.

---

# Part B – App design (AI drafts, you check)

## 3. Technology

Chosen so everyone can run the app on their own laptop with no extra accounts.

| Part | Choice | In plain words |
|------|--------|----------------|
| Web framework | **Next.js** (App Router) + **TypeScript** | Builds both the screens and the server logic in one project. |
| Database | **SQLite** via **Prisma 6** | The database is a single file; Prisma lets the code read and write it. |
| Login | Signed **session cookie** | After login the browser keeps a signed note saying who you are (7 days). JavaScript on the page can't read it (`httpOnly`). |
| Passwords | **bcryptjs** | Stores a scrambled version of each password. |
| Styling | **Tailwind CSS v4** | Styles are written as class names, e.g. `text-sm`. No config file needed. |
| Buttons and forms | **Server actions** | Pressing a button calls a function on the server, which checks the user before doing anything. There are no separate `/api` routes. |

## 4. Screens (routes)

After login, each user is sent to their role's home page. Opening a page for
another role sends you back to your own home page.

| Route | Who | What it shows |
|-------|-----|---------------|
| `/` | anyone | Sends you to your home page, or to `/login`. |
| `/login` | anyone | Email and password form. A logged-in user is sent to their home page. |
| `/employee` | Employee | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/supervisor` | Supervisor | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/hr` | HR | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |
| `/admin` | Admin | A page with only a short hint ("This page is empty. Continue here with your own project…") until Session 2. |

A page that doesn't exist shows **Not found**, with a button back to your
home page.

**Layout:** no sidebar. A top bar across every page shows the app name
(Budiman HRMS) on the left. On the right it shows who is logged in (name and
role) and a **Log out** button. On a phone it shows the user's initials
instead of the name and role. The page below the top bar is empty apart from a short hint line.

**Feedback:** **Log out** opens a confirmation box first. Errors are shown in
red above the form.

## 5. Where the code lives

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | The tables from Part A. |
| `prisma/migrations/` | Steps that create the tables. |
| `prisma/seed.ts` | The demo users (§6). |
| `src/lib/constants.ts` | Roles, divisions, designations, time zone, date helpers. |
| `src/lib/auth.ts` | Login cookie, `getCurrentUser()`, `requireRole()`, `roleHome()`. |
| `src/lib/db.ts` | The single database connection. |
| `src/app/actions.ts` | Server actions: `loginAction`, `logoutAction`. |
| `src/app/login/` | The login page. |
| `src/app/<role>/` | One folder per role's screens (pages with only a hint for now). |
| `src/components/` | Screen pieces: app frame (top bar), login form and log out button. |
| `src/components/ui/` | Small building blocks used everywhere: Button, Card, PageHeader, EmptyState, Avatar, Icons, form field styles, dialogs, and the overlay page scrollbar. Use these when you build the module. |
| `src/app/globals.css` | Brand colours (the `brand-…` and `navy` colours). Change them here. |

## 6. Demo data

`npm run db:seed` deletes all users and creates:

| Email (`@budiman.com`) | Name | Role | ID no. | Designation | Division |
|----------|------|------|--------|-------------|----------|
| `employee-1@` | Employee 1 (Finance & Administration) | Employee | 00-148291 | Administrative Officer | Finance & Administration |
| `employee-2@` | Employee 2 (Software Development) | Employee | 00-173604 | Software Engineer | Software Development |
| `supervisor-1@` | Supervisor 1 (Finance & Administration) | Supervisor | 00-159827 | Team Lead | Finance & Administration |
| `supervisor-2@` | Supervisor 2 (Software Development) | Supervisor | 00-126418 | Team Lead | Software Development |
| `hr-1@` | HR 1 (Human Resources) | HR | 00-191356 | HR Officer | Human Resources |
| `hr-2@` | HR 2 (Human Resources) | HR | 00-184072 | HR Officer | Human Resources |
| `admin@` | Admin (Management) | Admin | 00-105739 | Director | Management |

All use the password `password123` (workshop only). There are two users for
each of Employee, Supervisor and HR, in different divisions, so the module you
build can be tested with more than one person per role.

## 7. Security (in plain words)

- Every page checks who is logged in and their role (`requireRole`).
- Every server action checks again on the server – hiding a button is not enough.
- The login cookie is signed with `AUTH_SECRET` from `.env`, so it can't be faked.
- Passwords are stored only as a hash.

## 8. Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm run db:migrate` | Create or update the database tables |
| `npm run db:seed` | Reset the demo users |
| `npm run db:studio` | Open a browser view of the database |
| `npm run lint` | Check the code for common mistakes |
| `npm run build` | Check the whole app compiles |

---

# Leave Request – Design

> **How it is built.** Same rule as the login design above:
> [01-requirements.md](01-requirements.md) is the source of truth for
> *behaviour*; if the two disagree, fix the requirements first, then this
> file.
>
> - **Part A – Data design** (sections 1–4): **you own this** – approved
>   2026-11-10.
> - **Part B – App design** (sections 5–8): the AI drafts it; you check it.

---

# Part A – Data design (you review)

## 1. Tables

One new table. Every row gets a number (`id`) automatically. Dates are stored
as plain text like `2026-12-01`; date + time fields the same way the `User`
table already does.

### `LeaveRequest` – one row per leave request

A row is **one request from one employee**, from submission to its final
decision. It is created when the employee submits and is never edited
afterwards, except that the status, the decision fields and (on a rejection)
the remark are filled in by the right person. Rows are never deleted.

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the request |
| `employeeId` | number | yes | The Employee who requested – the number of their `User` row. Set by the app from the logged-in user, never from the form |
| `supervisorId` | number | yes | The Supervisor the employee picked, who must be in the employee's division at that moment (rule 3). Frozen at submission: a later division change does not move the request |
| `leaveType` | text | yes | `ANNUAL`, `SICK` or `OTHER` (rule 2) |
| `startDate` | date | yes | First day of the leave |
| `endDate` | date | yes | Last day of the leave; never before `startDate` (rule 1) |
| `days` | number | yes | Calendar days, `end − start + 1`. Calculated by the app (rule 1), never typed |
| `reason` | text | no | The employee's optional note; shown as "—" when empty |
| `status` | text | yes | One of the five values in §2 |
| `rejectRemark` | text | only on rejection | Why the supervisor or HR refused. Required to reject (rule 5); stays empty otherwise |
| `decidedByUserId` | number | no | Who decided: the Supervisor (on a supervisor rejection) or the HR officer (on an approval or HR rejection). The number of their `User` row; empty until a decision |
| `decidedAt` | date + time | no | When the decision was made; empty until a decision |
| `createdAt` | date + time | auto | When the request was submitted – the "submitted" column in the tables |

> **What is deliberately not stored.** No "signed at" or "sent to HR"
> timestamps: no screen shows them, so nothing is kept "in case".

> **Why plain text again?** `leaveType` and `status` are plain text because
> SQLite has no enums. The allowed values live in `src/lib/constants.ts`
> (`ANNUAL`, `SICK`, `OTHER`; `SUBMITTED`, `SIGNED`, `WITH_HR`, `APPROVED`,
> `REJECTED`) and the app checks them, exactly like `role` already does.

## 2. Statuses and allowed moves

A request starts at **Submitted** and moves forward only. Two states are
final – nothing leaves them.

| Stored value | What the user sees | Meaning |
|--------------|--------------------|---------|
| `SUBMITTED` | Awaiting supervisor | Handed in, waiting for the chosen supervisor |
| `SIGNED` | Signed – waiting to send to HR | Supervisor signed; waiting for the employee to send it to HR |
| `WITH_HR` | With HR | In the shared HR queue, waiting for any HR officer |
| `APPROVED` | Approved | Final. An HR officer approved it |
| `REJECTED` | Rejected | Final. The supervisor or an HR officer refused, with a remark |

Only these five moves are allowed. Every move asks for confirmation first and
shows a success message after (requirement U12), and the app checks on the
server that the person really holds the role the move needs (AC-25).

| From | Move | Only this person may | To | Also fills in |
|------|------|----------------------|----|----------------|
| `SUBMITTED` | Sign | The Supervisor on the request (`supervisorId`) | `SIGNED` | – |
| `SUBMITTED` | Reject | The Supervisor on the request | `REJECTED` | `rejectRemark`, `decidedByUserId`, `decidedAt` |
| `SIGNED` | Send to HR | The Employee who owns the request (`employeeId`) | `WITH_HR` | – |
| `WITH_HR` | Approve | Any user with role HR | `APPROVED` | `decidedByUserId`, `decidedAt` |
| `WITH_HR` | Reject | Any user with role HR | `REJECTED` | `rejectRemark`, `decidedByUserId`, `decidedAt` |

There is no other way to change a status: no cancel, no edit, no reopen, no
change made by Admin (rules 7–8).

## 3. Business rules

1. **Dates.** `endDate` is on or after `startDate`. Days are **calendar
   days**: every date from start to end counts, weekends included, so
   `days = end − start + 1`, a whole number the app calculates. Past dates
   and overlapping requests are allowed – no rule against them.
2. **Leave types.** Exactly `ANNUAL`, `SICK`, `OTHER`, from the list in
   `src/lib/constants.ts`. Anything else is refused.
3. **The supervisor.** Chosen from the Supervisors of the employee's own
   division (rule from Assumption A1) and stored on the request at
   submission. If the division has no Supervisor, no request can be created.
   The choice never changes afterwards.
4. **Only Employees submit.** Users with role Employee only; the request is
   always owned by the person who is logged in. Supervisors, HR and Admin
   cannot create requests.
5. **A rejection needs a remark.** A rejection without a remark is refused,
   whether it comes from the Supervisor or from HR. The remark is stored in
   `rejectRemark` and the employee sees it on the request.
6. **The decider is recorded.** Every approval or rejection writes
   `decidedByUserId` and `decidedAt`. The employee sees the decider's display
   name and the decision date (Assumption A5), e.g. "Rejected – HR 2,
   2026-11-12".
7. **Final is final.** `APPROVED` and `REJECTED` are closed for good. A
   rejected request cannot be edited, cancelled or reopened – a retry is a
   brand-new request (AC-23).
8. **Nobody edits anything.** After submission no field is editable by
   anyone: the only changes in the whole system are the five moves in §2,
   each performed by the right person. Admin has no change rights at all.

## 4. Who sees what

Row visibility. A role can open a request only if its row is in their set –
checking on the server, not by hiding links (AC-25).

| Role | Requests they can open | Requests they can act on |
|------|------------------------|--------------------------|
| Employee | Their own only (`employeeId` = me) | Own: send `SIGNED` → HR |
| Supervisor | Only those sent to them (`supervisorId` = me), any status | Those: sign or reject while `SUBMITTED` |
| HR | Every request in the system | Any `WITH_HR`: approve or reject |
| Admin | Every request in the system | Nothing – view only |

The shared HR list (§2's `WITH_HR` rows) shows requests from **every**
division, so both HR officers always see the same queue. The to-act list on
each home page is exactly the "requests they can act on" column above; the
history below it is the "requests they can open" set.

> **Demo data.** `npm run db:seed` will recreate sample requests covering
> every status (Assumption A3). The exact rows are defined in Part B §6.

# Part B – App design (AI drafts, you check)

## 5. Screens (routes)

The module hangs off the four role home pages that already exist. The top
bar, the login and the app frame stay exactly as they are. Every new page
starts with the login's `requireRole` check, and the rows it may show are
filtered on the server by §4's "who sees what": opening a request outside
your set gives **Not found**, the same as an unknown page in the login
(AC-09).

One screen per role action:

| Route | Who | What it shows | For everyone else |
|-------|-----|---------------|--------------------|
| `/employee` | Employee | Home. **To act:** own requests not yet finished – the signed one carries **Send to HR**. **History:** all own requests. **New leave request** button above the lists | Back to their own home |
| `/employee/leave/new` | Employee | The request form: leave type, start date, end date, reason (optional), and a supervisor dropdown with only the Supervisors of the employee's division. If the division has none, the form is replaced by a clear message (AC-14) | Back to their own home |
| `/employee/leave/[id]` | The owning Employee | The request: all fields, status, remarks, decider. **Send to HR** button only when the status is *Signed* (confirm → success). No edit, cancel or reopen anywhere | Not found |
| `/supervisor` | Supervisor | Home. **To act:** their `SUBMITTED` requests, each with **Sign** / **Reject**. **History:** everything ever sent to them | Back to their own home |
| `/supervisor/leave/[id]` | The Supervisor on that request | The request + **Sign** / **Reject**. Rejection opens a remark box that refuses an empty remark | Not found |
| `/hr` | HR | Home. **To act:** the shared queue – *every* `WITH_HR` request from every division – each with **Approve** / **Reject**. **History:** all requests | Back to their own home |
| `/hr/leave/[id]` | HR | The request + **Approve** / **Reject** with the same remark rule; the deciding officer is recorded | Not found |
| `/admin` | Admin | Home. One read-only table of every request in the system | Back to their own home |
| `/admin/leave/[id]` | Admin | The request, view only: status, remarks, decider. No buttons anywhere | Not found |

How the screens behave:

- **Lists:** the to-act list is exactly the role's "can act on" set from §4;
  the history below is its "can open" set. Columns per Assumption A8: type,
  dates, days, status, submitted – plus the supervisor on the employee's
  pages. Status shows as a small badge; an empty reason shows as "—".
- **Empty states:** no requests at all → "No leave requests yet" with the
  New button (Employees); empty to-act list → "Nothing to decide right now."
- **Feedback:** every action – submit, sign, reject, send to HR, approve –
  uses the confirmation dialog first and the success message after (U12),
  reusing `ConfirmDialog` and `SuccessModal`. Errors show in red above the
  form or dialog.

## 6. Demo data

`npm run db:seed` now deletes **users and requests**, then recreates the
7 users and these 8 requests:

| # | Employee | Supervisor | Type | Dates | Days | Reason | Status | Decided by | Remark |
|---|----------|------------|------|-------|------|--------|--------|------------|--------|
| 1 | employee-1 | supervisor-1 | Annual | 2026-12-01 → 02 | 2 | Family event | Awaiting supervisor | – | – |
| 2 | employee-1 | supervisor-1 | Sick | 2026-11-20 → 20 | 1 | Migraine | Signed – waiting to send to HR | – | – |
| 3 | employee-1 | supervisor-1 | Annual | 2026-11-05 → 07 | 3 | — | With HR | – | – |
| 4 | employee-1 | supervisor-1 | Annual | 2026-10-10 → 10 | 1 | Kids' sports day | Approved | HR 1 | – |
| 5 | employee-1 | supervisor-1 | Other | 2026-12-20 → 22 | 3 | Moving house | Rejected | Supervisor 1 | Release freeze – no leave in December |
| 6 | employee-2 | supervisor-2 | Annual | 2026-12-14 → 18 | 5 | Holiday with family | Awaiting supervisor | – | – |
| 7 | employee-2 | supervisor-2 | Sick | 2026-11-25 → 26 | 2 | Food poisoning | With HR | – | – |
| 8 | employee-2 | supervisor-2 | Sick | 2026-10-01 → 03 | 3 | Dengue fever | Rejected | HR 2 | No medical certificate attached |

This covers every status, a rejection by the supervisor and one by HR (both
with remarks), requests waiting for each of the two supervisors, HR requests
from both divisions decided by both HR officers, and one Signed request so
the send-to-HR flow (AC-19) can be tested right after seeding.

## 7. Where the code lives

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | The `LeaveRequest` table from Part A §1. |
| `prisma/migrations/` | One new migration that creates it. |
| `prisma/seed.ts` | Adds the demo requests from §6. |
| `src/lib/constants.ts` | Adds the leave types, the five status values with their display labels, and the calendar-days helper. |
| `src/lib/leave.ts` *(new)* | Server-side helpers: list the requests a user may open (§4), load one request or return Not found, the Supervisors of a division, and the single place that checks whether one of the five moves in §2 is allowed for the current user. |
| `src/app/actions.ts` | Adds five server actions – create, send to HR, sign, reject, approve – each calling the check in `src/lib/leave.ts` before touching anything. |
| `src/components/leave/` *(new)* | `LeaveTable` (to-act + history), `StatusBadge`, `LeaveForm`, `LeaveDetail` (built with `DetailSection`), `DecideDialog` (reject with required remark; approve confirmation), and the action buttons. |
| `src/app/<role>/page.tsx` | The four home pages now render `LeaveTable` instead of the hint line. |
| `src/app/<role>/leave/…` | The new screens from §5: `employee/leave/new`, and `leave/[id]` under each role. |

Reused unchanged: everything in `src/components/ui/` (Button, Card, Field,
ConfirmDialog, SuccessModal, DetailSection, EmptyState, PageHeader),
`src/lib/auth.ts`, `src/lib/db.ts`, the top bar and the login.

## 8. Security and commands

- Every new page calls `requireRole` before querying; a request outside the
  user's §4 set is Not found – no "you may not see this" page that leaks
  its existence.
- Every server action re-checks on the server: the role, the owner or the
  addressed supervisor, the current status (the move must be one of the
  five), the remark on rejections, and the supervisor-exists rule at
  creation. Hiding a button is not enough (AC-25).
- Login, cookies and users are untouched.
- No new commands: `npm run db:migrate` and `npm run db:seed` cover the
  module.
