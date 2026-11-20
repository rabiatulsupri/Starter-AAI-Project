# Login – Requirements

> **This file answers:** What should the app do, and why?
> **Who:** The AI drafts it from your interview. You review it.
>
> When the app's behaviour needs to change, update this file **first**.

## 1. The problem

Budiman Company is replacing paper leave forms with a Leave Request
module. Before anyone can submit or sign anything, the system must know
who they are: today a paper form carries no check that the person
handing it in is who it says. Only Budiman staff may use the system,
each person has exactly one role, and each role must see only the
pages that belong to it.

This module provides:

1. Login with a work email (`@budiman.com`) and a password
2. One signed session cookie per user, lasting one work shift (8 hours)
3. A landing page per role, and a gate that stops users opening another
   role's pages
4. Logout from every page
5. Seeded demo accounts so everyone tests with the same logins

Passwords are stored hashed with bcryptjs, never as plain text
(brief §7.1, §7.2). The login form is a server action — no separate
API.

## 2. Who uses it (roles)

| Role | Home page | What they do |
|------|-----------|--------------|
| **Employee** | `/employee` | Signs in and lands on the employee home; sees only employee pages |
| **Supervisor** | `/supervisor` | Signs in and lands on the supervisor home; sees only supervisor pages |
| **HR** | `/hr` | Signs in and lands on the HR home; sees only HR pages |
| **Admin** | `/admin` | Signs in and lands on the admin home; sees only admin pages |

The four roles come from the brief §4. In this module every role does
the same thing — sign in, reach its own home, sign out. What they do
after that belongs to the leave request module.

## 3. User stories

- **U1. Sign in** *(High)*. As a Budiman staff member, I can log in
  with my work email and password so that only staff can use the
  system. → Test: AC-01
- **U2. Land on my role's home** *(High)*. As a user with a role, I am
  sent to my own home page after login so that I see only what belongs
  to my role. → Test: AC-01
- **U3. Stay out of other roles' pages** *(High)*. As a user, I cannot
  open a page that belongs to another role, so the four roles stay
  separate. → Test: AC-02
- **U4. Locked until logged in** *(High)*. As a visitor who is not
  logged in, I am sent to the login page whenever I try to open any
  page, so nothing is readable without an account. → Test: AC-03
- **U5. Safe failure message** *(High)*. As a user who mistypes
  credentials, I see one generic error so that nobody can learn which
  emails exist in the system. → Test: AC-04
- **U6. Seed the demo accounts** *(High)*. As a developer, I can load
  the six demo accounts and the divisions with one command so that
  everyone tests with the same logins. → Test: AC-05
- **U7. Sign out** *(High)*. As a logged-in user, I can sign out from a
  button on every page so that the next person at my laptop is not
  signed in as me. → Test: AC-06
- **U8. Session expires after one shift** *(Medium)*. As a user, I am
  asked to log in again after 8 hours so that a forgotten-open laptop
  does not stay signed in. → Test: AC-07
- **U9. Budiman email only** *(Medium)*. As a user, the login form
  rejects an email that does not end with `@budiman.com` before
  calling the server, so I get told early that only work emails work.
  → Test: AC-08
- **U10. Passwords stored hashed** *(High)*. As the company, every
  password is saved as a bcrypt hash, so a stolen database file does
  not hand out passwords. → Test: AC-09

## 4. Acceptance checklist

The demo accounts below are seeded by the project (brief §7.2).
Everyone logs in with their email and the password `password123`.

| Email | Name | Role |
|-------|------|------|
| employee-1@budiman.com | Employee 1 | Employee |
| supervisor-1@budiman.com | Supervisor 1 | Supervisor |
| supervisor-2@budiman.com | Supervisor 2 | Supervisor |
| hr-1@budiman.com | HR 1 | HR |
| hr-2@budiman.com | HR 2 | HR |
| admin@budiman.com | Admin | Admin |

| Status | ID | Check | How to test |
|--------|----|-------|-------------|
| To do | AC-01 | Each account logs in and lands on its own role home | • Go to `/login`<br>• Sign in as employee-1@budiman.com / password123<br>• You should land on `/employee`, with your name and a Sign out button visible<br>• Repeat for supervisor-1 (→ `/supervisor`), hr-1 (→ `/hr`), admin (→ `/admin`) |
| To do | AC-02 | Another role's pages are closed to you | • Sign in as employee-1@budiman.com<br>• Type `/admin` in the address bar<br>• You should be redirected to `/employee` (or see an access-denied page) — the admin page content must not show<br>• Repeat `/hr` and `/supervisor` the same way |
| To do | AC-03 | No page opens without a session | • Sign out (or open a private window)<br>• Type `/employee` in the address bar<br>• You should see the login page, not employee content |
| To do | AC-04 | Wrong credentials get one generic error | • On `/login`, enter admin@budiman.com with the password `wrongpass` and submit<br>• You should see "Invalid email or password" and stay on `/login`<br>• Now enter nobody@budiman.com / password123<br>• You should see exactly the same message — it must not say whether the email exists |
| To do | AC-05 | One command loads the demo data | • From a fresh database file, run `npx prisma db seed`<br>• The Users table should hold the six accounts above, plus the four divisions (Finance, Human Resources, Information Technology, Operations) with their designations<br>• All six accounts should pass AC-01 |
| To do | AC-06 | Sign out ends the session | • Sign in as any account<br>• Click the Sign out button in the header<br>• You should return to `/login`<br>• Press the browser Back button or type `/employee`<br>• You should be sent back to `/login`, not the employee home |
| To do | AC-07 | Sessions die after 8 hours | • Sign in as employee-1, then edit the session cookie in the browser's dev tools so its expiry is in the past<br>• Navigate to `/employee`<br>• You should be sent to `/login`; signing in again works normally |
| To do | AC-08 | Only `@budiman.com` emails are accepted | • On `/login`, type `someone@gmail.com` and a password<br>• Submitting should be blocked with a message that the email must end with `@budiman.com`, without a server round-trip error<br>• Sending `someone@gmail.com` straight to the server action should still be refused |
| To do | AC-09 | Passwords are stored hashed | • After seeding, open the database (Prisma Studio or `sqlite3 dev.db`) and look at the Users table<br>• Each password should start with `$2a$` or `$2b$` (a bcrypt hash) — the text `password123` must not appear anywhere in the file |
| To do | AC-10 | Logging in while already signed in behaves | • Sign in as employee-1, then open `/login` directly<br>• Submitting the form should either re-login you to `/employee`, or send you straight to `/employee` — the app must not end up with two conflicting sessions |

## 5. Not included (for now)

- Sign-up or any way to create accounts — the seeded demo accounts are
  the only logins (agreed in interview)
- Forgotten password / password reset
- Account lockout or rate-limiting after repeated failed attempts —
  the generic error covers the information leak; lockout is the next
  step if the company wants it
- "Remember me" option — sessions are 8 hours, full stop
- Sending users back to the page they first asked for after login —
  login always lands on the role home
- Anything about leave requests themselves — that is the next spec
