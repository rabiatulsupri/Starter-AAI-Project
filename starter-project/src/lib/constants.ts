// Shared constants and helpers for the Budiman HRMS starter app.
// Roles, leave types and leave statuses are plain string unions (SQLite has
// no enums). The Leave Request values are at the bottom.

export const ROLES = ["EMPLOYEE", "SUPERVISOR", "HR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Employee",
  SUPERVISOR: "Supervisor",
  HR: "HR",
  ADMIN: "Admin",
};

// Every account uses a company email address.
export const EMAIL_DOMAIN = "budiman.com";

// The divisions and designations a user can have. Stored as plain text on the user.
export const DIVISIONS = [
  "Software Development",
  "Quality Assurance",
  "IT Infrastructure & Operations",
  "Cybersecurity",
  "Data & Analytics",
  "Product & Design",
  "Customer Support",
  "Human Resources",
  "Finance & Administration",
  "Management",
] as const;

export const DESIGNATIONS = [
  "Software Engineer",
  "QA Engineer",
  "System Administrator",
  "IT Support Technician",
  "Data Analyst",
  "UI/UX Designer",
  "Team Lead",
  "HR Officer",
  "Administrative Officer",
  "Director",
] as const;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// The company's time zone. It decides what "today" is and how dates are shown.
export const APP_TIME_ZONE = "Asia/Brunei";

// Today's date in the company time zone, as a YYYY-MM-DD string.
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Format a moment in time (e.g. submittedAt) as DD-MM-YYYY in the company time zone.
export function formatTimestamp(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(d)
    .replaceAll("/", "-");
}

// ---- Leave Request (design Part A §1–§2) ----

export const LEAVE_TYPES = ["ANNUAL", "SICK", "OTHER"] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  OTHER: "Other",
};

export const LEAVE_STATUSES = [
  "SUBMITTED",
  "SIGNED",
  "WITH_HR",
  "APPROVED",
  "REJECTED",
] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

// What the user sees for each status (Part A §2).
export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  SUBMITTED: "Awaiting supervisor",
  SIGNED: "Signed – waiting to send to HR",
  WITH_HR: "With HR",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function isLeaveType(value: string): value is LeaveType {
  return (LEAVE_TYPES as readonly string[]).includes(value);
}

export function isLeaveStatus(value: string): value is LeaveStatus {
  return (LEAVE_STATUSES as readonly string[]).includes(value);
}

// Calendar days from start to end, inclusive (Part A rule 1): weekends
// count, so a request always shows a whole number. The dates are YYYY-MM-DD
// strings. A result below 1 means the end date is before the start date —
// invalid.
export function leaveDays(startIso: string, endIso: string): number {
  const MS_PER_DAY = 86_400_000;
  const startMs = Date.parse(`${startIso}T00:00:00Z`);
  const endMs = Date.parse(`${endIso}T00:00:00Z`);
  return (endMs - startMs) / MS_PER_DAY + 1;
}
