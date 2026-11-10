# HRMS · Leave Request

The workshop app for the **Vibe Coding 101 with Agentic AI** sessions. It is
Budiman Company's HR Management System starter with the **Leave Request
module** built on top of it, the Spec-Driven Development way: the
specifications in `docs/specs/` were written and approved first, then the AI
agent built task by task from them.

## What's here

- **Login and logout** with a company email and password, and a signed
  session cookie.
- **Four roles** – Employee, Supervisor, HR and Admin – each with its own home
  page. Nobody can open another role's pages.
- **Leave requests**, following the flow *Employee → Supervisor → HR*:
  - Employees submit a request (type, dates, optional reason) to a supervisor
    from their own division; the calendar days are counted for them.
  - The addressed supervisor signs it or rejects it with a remark.
  - Once signed, the employee sends it to HR; either HR officer then approves
    or rejects it, and the deciding officer is recorded.
  - Decisions close a request; a retry means a new request. Admins can read
    every request but act on none.
  - Every list and button checks the server too — hidden buttons are not the
    security (see `applyMove` in `src/lib/leave.ts`).
- **The app frame**: a top bar with the app name, who is logged in and **Log out**, in the Budiman HRMS style.
- **Building blocks** in `src/components/ui/` (Button, Card, PageHeader,
  dialogs, form fields…) to reuse when you build the module.
- **The login spec** in `docs/specs/` – a worked example of the three spec
  files you will write for the Leave Request module.

## The project

The scenario, workflow and scope are in the **Workshop Project Brief**, which
you get from the facilitator. In Session 2 the AI agent interviews you about
it before writing anything.

## Tech stack

- **Next.js** (App Router) + TypeScript
- **Prisma 6** + **SQLite** (a local file database, no server needed)
- **Tailwind CSS**
- **bcryptjs** for password hashing
- Signed, `httpOnly` session cookie for login

## Getting started

You need **Node.js 20.9 or newer** (check with `node --version`) and Git.

```bash
npm install            # 1. install dependencies (needs internet)
cp .env.example .env   # 2. create your settings file (Windows: copy .env.example .env)
npm run db:migrate     # 3. create the SQLite database from prisma/migrations
npm run db:seed        # 4. add the demo users
npm run dev            # 5. start the app at http://localhost:3000
```

To reset the demo users at any time, run `npm run db:seed` again.

**If something goes wrong**

| Problem | Fix |
|---------|-----|
| `Environment variable not found: DATABASE_URL` | You skipped step 2. Create the `.env` file. |
| `npm install` fails while downloading Prisma engines | Your network blocks `binaries.prisma.sh`. Try another network, or ask the facilitator. |
| `Port 3000 is in use` | Another app is running. Stop it, or run `npm run dev -- -p 3001`. |
| Login says "Invalid email or password" | Run `npm run db:seed` to recreate the demo users. |

## Demo accounts

All demo users share the password `password123`.

| Email                      | Role | Home page |
| -------------------------- | ---- | --------- |
| `employee-1@budiman.com`   | Employee | `/employee` |
| `employee-2@budiman.com`   | Employee | `/employee` |
| `supervisor-1@budiman.com` | Supervisor | `/supervisor` |
| `supervisor-2@budiman.com` | Supervisor | `/supervisor` |
| `hr-1@budiman.com`         | HR | `/hr` |
| `hr-2@budiman.com`         | HR | `/hr` |
| `admin@budiman.com`        | Admin | `/admin` |

## Demo leave requests

`npm run db:seed` also creates 8 demo requests so every screen has something
to show (5 for Employee 1 with Supervisor 1 in Finance & Administration,
3 for Employee 2 with Supervisor 2 in Software Development):

| Employee  | Type   | Dates                    | Status shown             |
| --------- | ------ | ------------------------ | ------------------------ |
| Employee 1 | Annual | 01 → 02 Dec 2026 (2 d)  | Awaiting supervisor      |
| Employee 1 | Sick   | 20 Nov 2026 (1 d)        | Signed – waiting to send to HR |
| Employee 1 | Annual | 05 → 07 Nov 2026 (3 d)   | With HR                  |
| Employee 1 | Annual | 10 Oct 2026 (1 d)        | Approved (by HR 1)       |
| Employee 1 | Other  | 20 → 22 Dec 2026 (3 d)   | Rejected (by Supervisor 1, with a remark) |
| Employee 2 | Annual | 14 → 18 Dec 2026 (5 d)   | Awaiting supervisor      |
| Employee 2 | Sick   | 25 → 26 Nov 2026 (2 d)   | With HR                  |
| Employee 2 | Sick   | 01 → 03 Oct 2026 (3 d)   | Rejected (by HR 2, with a remark) |

A good first walk-through: sign the 01 Dec request as `supervisor-1`, send it
to HR as `employee-1`, then approve or reject it as `hr-1` or `hr-2`. Running
`npm run db:seed` again puts all eight demo requests back the way they were.

## Scripts

| Command            | What it does |
|--------------------|--------------|
| `npm run dev`      | Start the dev server. |
| `npm run build`    | Production build. |
| `npm run start`    | Serve the production build. |
| `npm run lint`     | Run ESLint. |
| `npm run db:migrate` | Apply Prisma migrations. |
| `npm run db:seed`  | Reseed the demo users. |
| `npm run db:studio` | Open Prisma Studio to inspect the data. |

## Specifications

The specs live in `docs/specs/`. Start with `docs/specs/README.md` – it
explains how to read them and has a glossary of terms.

- `01-requirements.md` — user stories and the acceptance checklist (the *what* and *why*).
- `02-design.md` — Part A: data design (the `User` and `LeaveRequest` tables, statuses, rules). Part B: app design (screens, code layout).
- `03-tasks.md` — the ordered build tasks and which checks prove each one is done.

`docs/specs/checklists.md` has a checklist to run before each approval and
build step.

The Leave Request module is documented in these same three files (Tasks 7–14).
The rule of the workshop: when something changes, **fix the spec first**, then
build it.

## Working with the AI agent

`AGENTS.md` tells the AI agent how to work with you in Session 2: it
**interviews you first**, writes the specs with you one at a time (waiting for
your approval after each), then builds task by task and asks you to check
each one in the browser.

To begin, start a new chat in the Illham Harness and type the line below. You
can also attach the Workshop Project Brief to give the agent the details.

> Read AGENTS.md, then start the interview.
