# Login – Requirements

> **What and why.** This document says what the login must do and why. It is
> the source of truth for behaviour: when something needs to change, update this
> document **first**. New to specs? Read [README.md](README.md) first.

## 1. The problem

Budiman Company is building an HR Management System. Before anyone can use
it, the system has to know **who is using it** and **what they are allowed to
do**.

This first part of the system provides:

1. A **login** with each person's company email and password.
2. A **home page for each role**, so everyone lands in the right place.
3. **Protection**, so nobody can open another role's pages.

## 2. Who uses it (roles)

| Role | Home page | What they will do (built in Session 2) |
|------|-----------|-----------------------------------------|
| **Employee** | `/employee` | Apply for leave and track their requests. |
| **Supervisor** | `/supervisor` | Decide on requests sent to them. |
| **HR** | `/hr` | Decide on requests sent to HR. |
| **Admin** | `/admin` | See every leave record. |

Each user has exactly one role.

## 3. User stories

Format: *As a [role], I can [do something] so that [benefit].*

- **U1. Log in** *(Core)*. As any user, I can log in with my company email and
  password so that I see the screens for my role.
- **U2. Land on my home page** *(Core)*. As any user, after logging in I go
  straight to my role's home page, so I don't have to look for it.
- **U3. Stay logged in** *(Core)*. As any user, I stay logged in for up to 7
  days on the same browser, so I don't have to log in every time.
- **U4. Log out** *(Core)*. As any user, I can log out when I'm done, so the
  next person on this computer can't use my account.
- **U5. Only my own screens** *(Core)*. As any user, I can only open the pages
  for my own role, so nobody can act as someone else.

## 4. Acceptance checklist

The login is done when every box is ticked. Use the demo accounts (password
`password123`): `employee-1` and `employee-2` (Employees), `supervisor-1` and
`supervisor-2` (Supervisors), `hr-1` and `hr-2` (HR), `admin` (Admin). Each
logs in with that name followed by `@budiman.com`, e.g.
`employee-1@budiman.com`; the checks below use the short name.
Run `npm run db:seed` first to start from clean data.

| ✓ | ID | Check | How to test |
|---|----|-------|-------------|
| [ ] | AC-01 | A user can log in and lands on their role's home page. | Log in as `employee-1` → you are on `/employee`, a page with only a short hint line. Repeat for `supervisor-1` (`/supervisor`), `hr-1` (`/hr`), `admin` (`/admin`). |
| [ ] | AC-02 | A wrong password or an unknown email shows an error. | Log in as `employee-1` with password `wrong` → "Invalid email or password." Try `nobody@budiman.com` → the same message. |
| [ ] | AC-03 | Empty fields are not sent. | Click **Log in** with the boxes empty → the browser asks you to fill them in. |
| [ ] | AC-04 | A logged-out user is sent to the login page. | Log out, then type `/employee` in the address bar → you are on `/login`. |
| [ ] | AC-05 | A logged-in user who opens the login page goes to their home page. | Logged in as `hr-1`, type `/login` → you are on `/hr`. |
| [ ] | AC-06 | Logging out asks first, then returns to the login page. | Click **Log out** in the top bar → a confirmation box → confirm → you are on `/login`. |
| [ ] | AC-07 | A user cannot open another role's pages. | As `employee-1`, type `/hr` or `/admin` → you are sent back to `/employee`. As `admin`, type `/employee` → you are sent back to `/admin`. |
| [ ] | AC-08 | Every page shows who is logged in. | The top bar shows the user's name and role. On a phone, it shows the user's initials instead. |
| [ ] | AC-09 | An unknown page shows "Not found". | Type `/something-else` → "Not found", with a button back to your home page. |
## 5. Not included (for now)

These are **out of scope** for the login:

- Signing up, or resetting a forgotten password.
- Adding, editing or deleting user accounts (only the demo data creates users).
- The Leave Request module itself – that is what you build in Session 2.

---

# Leave Request – Requirements

> **What and why.** This document says what the Leave Request module must do
> and why. Like the login part above, it is the source of truth for
> behaviour: when something needs to change, update this document **first**.
> New to specs? Read [README.md](README.md) first.

## 1. The problem

Budiman Company still processes leave on paper: the employee fills in a form,
the supervisor signs it, HR receives a copy and types it into a spreadsheet.
This causes three problems:

1. Forms get lost or delayed between the employee, the supervisor and HR.
2. Employees can't see where their request is.
3. HR has no single list of requests waiting for a decision.

The Leave Request module replaces the paper form inside the HRMS: **one
request, one system, visible from submission to decision.** A request moves
from the employee to their division's supervisor, then – once signed – to a
shared HR queue, where either HR officer decides. The admin sees every record
and changes nothing.

## 2. Who uses it (roles)

| Role | What they do in this module |
|------|-----------------------------|
| **Employee** | Submits a leave request to a supervisor **of their own division**, tracks its status and remarks, and sends a supervisor-signed request to HR. Only Employees submit. |
| **Supervisor** | Sees the requests sent to them, and signs or rejects each one. A rejection needs a remark. |
| **HR** | Sees every request waiting for HR in one shared list (any division), and approves or rejects it. A rejection needs a remark. The officer who decides is recorded. |
| **Admin** | Sees every leave record: view only, changes nothing. |

The status a request shows along the way (the exact stored values are decided
in design Part A):

**Awaiting supervisor** → **Signed – waiting to send to HR** → **With HR** →
**Approved** or **Rejected**.

## 3. User stories

Format: *As a [role], I can [do something] so that [benefit].*
All stories in this module are **Core** – the brief's flow only works end to
end if every one of them is present, and the interview added no Stretch items.

- **U6. Submit a leave request** *(Core)*. As an Employee, I can submit a
  request (leave type, start date, end date, optional reason) to a supervisor
  of my own division so that my leave goes into the system instead of onto
  paper.
- **U7. Track my requests** *(Core)*. As an Employee, I can see every request
  I have made with its status, remarks and decision-maker, so that I always
  know where my request is and why it was refused.
- **U8. Send a signed request to HR** *(Core)*. As an Employee, I can send a
  request my supervisor has signed to the shared HR queue, so that HR makes
  the final decision.
- **U9. Decide as supervisor** *(Core)*. As a Supervisor, I can sign or reject
  the requests sent to me – a rejection must carry a remark – so that the
  employee knows the outcome and the reason.
- **U10. Decide as HR** *(Core)*. As an HR officer, I can approve or reject any
  request in the shared HR list – a rejection must carry a remark – and the
  officer who decides is recorded, so that there is one list and nothing gets
  lost.
- **U11. See every record** *(Core)*. As an Admin, I can see every leave
  request with its status and remarks, without being able to change anything,
  so that HR can answer any question about leave.
- **U12. Confirm before anything changes** *(Core)*. As any user, every action
  (submit, sign, reject, send to HR, approve) asks for confirmation first and
  shows a success message after, so that a request never changes by a
  mis-click.

## 4. Acceptance checklist

The module is done when every box is ticked, **in addition to** the login
checks AC-01…AC-09. Use the demo accounts (password `password123`):
`employee-1` and `employee-2` (Employees), `supervisor-1` and `supervisor-2`
(Supervisors), `hr-1` and `hr-2` (HR), `admin` (Admin). Run `npm run db:seed`
first to start from clean data (the seed also recreates sample requests – see
Assumption A3). Dates in the checks are examples; any dates work as long as
the counting is verified.

| ✓ | ID | Check | How to test |
|---|----|-------|-------------|
| [ ] | AC-10 | An Employee can submit a request and sees it waiting for the supervisor. | As `employee-1` on `/employee` click **New leave request** → pick Annual, start 2026-12-01, end 2026-12-02, leave the reason empty → **Submit** → a confirmation box appears → confirm → a success message shows. The request appears in the to-act list with status **Awaiting supervisor** and **2** days. Then open the form again and press **Cancel** on the confirmation box → nothing is created. |
| [ ] | AC-11 | Empty required fields are not sent; end before start is refused. | Click **Submit** with type/dates empty → the browser asks you to fill them in. Pick start 2026-12-05, end 2026-12-01 → a red error shows above the form and no request is created (the list is unchanged). |
| [ ] | AC-12 | Days are calendar days, weekends included. | Create a request 2026-12-04 (Friday) to 2026-12-07 (Monday) → it shows **4** days. The 2026-12-01→02 request from AC-10 shows **2** days. |
| [ ] | AC-13 | The supervisor list offers only supervisors of the employee's own division. | As `employee-1` (Finance & Administration) open the form → the supervisor dropdown shows only "Supervisor 1 (Finance & Administration)". As `employee-2` (Software Development) → only "Supervisor 2 (Software Development)". |
| [ ] | AC-14 | With no supervisor in the division, submission is blocked with a clear message. | In Prisma Studio (`npm run db:studio`) set `employee-2`'s `division` to `Customer Support` (no supervisor there). Log in as `employee-2` → `/employee` explains that no supervisor is available in your division and a request cannot be created. Restore the data with `npm run db:seed`. |
| [ ] | AC-15 | An Employee sees only their own requests. | As `employee-1`, `/employee` lists only `employee-1`'s requests – none of `employee-2`'s appear, in the to-act list or the history. |
| [ ] | AC-16 | A Supervisor sees only the requests sent to them. | As `employee-1`, send a request to `supervisor-1`; as `employee-2`, send one to `supervisor-2`. As `supervisor-1` on `/supervisor` → the to-act list shows only `employee-1`'s request; nothing addressed to `supervisor-2` appears. |
| [ ] | AC-17 | Signing works with confirmation and success. | As `supervisor-1`, on `employee-1`'s request click **Sign** → confirm → success message. The request now shows **Signed – waiting to send to HR** and moves out of the to-act list into the history. |
| [ ] | AC-18 | A supervisor rejection needs a remark, and the employee sees it. | As `supervisor-1` click **Reject** on a request and try to confirm with the remark empty → refused with an error asking for a remark. Enter "Not in December – release freeze" → confirm → success; the request shows **Rejected**. As `employee-1` the same request shows Rejected with that remark visible. |
| [ ] | AC-19 | Only a signed request can be sent to HR. | As `employee-1`: requests with status **Awaiting supervisor** or **Rejected** show no **Send to HR** button. On the request signed in AC-17 click **Send to HR** → confirm → success; the status becomes **With HR**. |
| [ ] | AC-20 | The HR to-act list is shared: every request waiting for HR, from any division. | Also send `employee-2`'s signed request to HR. Log in as `hr-2` → `/hr` to-act list shows **both** requests, including `employee-1`'s (a different division). As `hr-1` you see the same shared list. |
| [ ] | AC-21 | An HR approval records who decided and when. | As `hr-2` click **Approve** on `employee-1`'s request → confirm → success. The record shows **Approved** with the deciding officer "HR 2" and the decision date. |
| [ ] | AC-22 | An HR rejection needs a remark, is recorded, and closes the request. | As `hr-2` try **Reject** on `employee-2`'s request with the remark empty → refused. Enter a remark → confirm → success; the request shows **Rejected** and as `employee-2` the remark and "decided by HR 2" are visible. |
| [ ] | AC-23 | A rejected request is final; a retry is a new request. | As `employee-1` open the request rejected in AC-18 → there is no way to edit, cancel or reopen it. **New leave request** still works and creates a fresh request in the list. |
| [ ] | AC-24 | The Admin sees every record and changes nothing. | As `admin` on `/admin` → every request from both employees is listed with its status, remarks and deciding officer. The page offers **no** New, Sign, Reject, Approve or Send to HR buttons. |
| [ ] | AC-25 | Only the right role can act, enforced on the server. | In the UI no wrong-role control is offered (AC-16/19/24). The reviewer agent additionally attempts each action (sign, reject, send, approve) as the wrong role directly (server-action call) → the server refuses and nothing changes. |

## 5. Not included (for now)

Out of scope for this module:

- Notifications or emails – roles see their lists when they open the app.
- Leave balances or annual quotas – the system does not track allowances.
- Attachments on a request (e.g. a medical certificate).
- Editing or cancelling a submitted, signed or decided request – rejected is
  final and a retry is a new request; there is no cancel/withdraw.
- Half days or shifts – whole calendar days only.
- Supervisor, HR and Admin taking leave through this module – **Employees
  only** submit.
- Archive pages – finished requests stay in the history area of the home pages.
- Any change to login, roles or user management.

## Assumptions

Decisions not settled in the interview that this document makes explicit.
If any is wrong, correct it **here** before the design.

- **A1.** "Supervisor of their own division" = users with role `SUPERVISOR`
  whose `division` equals the employee's `division` field. If the list is
  empty, submission is blocked (AC-14).
- **A2.** The five status names above are what users see. Supervisor rejection
  and HR rejection both display as **Rejected**; who decided, when, and the
  remark are stored and shown to the employee. Stored values are decided in
  design Part A.
- **A3.** `npm run db:seed` will recreate a small set of demo leave requests
  covering every status, so the checks can start from clean data. The exact
  sample rows are specified in design Part B §6.
- **A4.** Dates are plain calendar dates in the app's configured time zone
  (`src/lib/constants.ts`); "days" = end − start + 1, always a whole number.
- **A5.** The deciding officer is shown by display name (e.g. "HR 2"), the
  decision date by calendar date.
- **A6.** The employee's reason, when left empty, displays as "—" in tables
  and detail views.
- **A7.** Every new story here is Core; nothing in this module is Stretch.
- **A8.** Table columns for the to-act list and the history are the same:
  type, dates, days, status, submitted date – plus the supervisor for
  Employees. Detail views show the reason and remarks.
