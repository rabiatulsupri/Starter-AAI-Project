# Project rules

## What this is

Budiman HRMS — a Leave Request module built from scratch as a practice
project. Employees submit leave requests, supervisors sign them, HR
approves or rejects them, and an admin views everything. The brief is
`docs/Agentic AI - HRMS Doc.pdf`; it is the source of truth.

## Built with

Next.js (App Router) with TypeScript, Tailwind CSS, SQLite via Prisma,
and Tailwind. Login: signed session cookie, passwords hashed with
bcryptjs. Form buttons use server actions, not a separate API. Versions
are pinned in `package.json` — do not upgrade or add packages without
being asked.

## Run it

`npm install`, then `npm run dev` (port 3000; use `-p 3001` if busy).
Check work in the browser before calling it done.

## Where things live

- `docs/Agentic AI - HRMS Doc.pdf` — the requirements brief.
- `docs/specs/` — the specs (requirements, design, tasks). Read them
  before building; write them from `docs/templates/` if missing.
- `src/app/` — all screens and server actions.

## How to work

- Spec-driven: agree the spec first, build from it, check the result
  against it. If something is wrong, fix the spec first, then the code.
- Build one small task at a time, High-priority requirements first,
  login first.
- Ask before starting anything not covered by the docs.
- Every commit message must use conventional commits, such as
  "feat: add login page" or "fix: require remark on rejection".

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
