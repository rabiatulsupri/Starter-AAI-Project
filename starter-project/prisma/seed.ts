import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  isLeaveStatus,
  isLeaveType,
  leaveDays,
} from "../src/lib/constants";

const prisma = new PrismaClient();

// The demo users (design §6). Every one logs in with the password "password123".
// Each name includes the user's division in brackets.
const USERS = [
  { email: "employee-1@budiman.com", name: "Employee 1 (Finance & Administration)", role: "EMPLOYEE", identificationNo: "00-148291", designation: "Administrative Officer", division: "Finance & Administration" },
  { email: "employee-2@budiman.com", name: "Employee 2 (Software Development)", role: "EMPLOYEE", identificationNo: "00-173604", designation: "Software Engineer", division: "Software Development" },
  { email: "supervisor-1@budiman.com", name: "Supervisor 1 (Finance & Administration)", role: "SUPERVISOR", identificationNo: "00-159827", designation: "Team Lead", division: "Finance & Administration" },
  { email: "supervisor-2@budiman.com", name: "Supervisor 2 (Software Development)", role: "SUPERVISOR", identificationNo: "00-126418", designation: "Team Lead", division: "Software Development" },
  { email: "hr-1@budiman.com", name: "HR 1 (Human Resources)", role: "HR", identificationNo: "00-191356", designation: "HR Officer", division: "Human Resources" },
  { email: "hr-2@budiman.com", name: "HR 2 (Human Resources)", role: "HR", identificationNo: "00-184072", designation: "HR Officer", division: "Human Resources" },
  { email: "admin@budiman.com", name: "Admin (Management)", role: "ADMIN", identificationNo: "00-105739", designation: "Director", division: "Management" },
];

// The demo leave requests (design Part B §6). They cover every status, a
// rejection by the supervisor and one by HR (both with remarks), requests
// waiting for each of the two supervisors, HR requests from both divisions
// decided by both HR officers, and one Signed request for the send-to-HR
// test (AC-19). `days` is computed with the same calendar-days rule the app
// uses (Part A rule 1).
// createdAt is set so the "submitted" column shows sensible, stable dates:
// each request was submitted before its decision and its first leave day.
const REQUESTS = [
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "ANNUAL", startDate: "2026-12-01", endDate: "2026-12-02", reason: "Family event", status: "SUBMITTED", decidedBy: null, decidedAt: null, rejectRemark: null, createdAt: "2026-11-09T02:00:00Z" },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "SICK", startDate: "2026-11-20", endDate: "2026-11-20", reason: "Migraine", status: "SIGNED", decidedBy: null, decidedAt: null, rejectRemark: null, createdAt: "2026-11-08T02:00:00Z" },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "ANNUAL", startDate: "2026-11-05", endDate: "2026-11-07", reason: null, status: "WITH_HR", decidedBy: null, decidedAt: null, rejectRemark: null, createdAt: "2026-10-28T02:00:00Z" },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "ANNUAL", startDate: "2026-10-10", endDate: "2026-10-10", reason: "Kids' sports day", status: "APPROVED", decidedBy: "hr-1@budiman.com", decidedAt: "2026-09-28T09:00:00Z", rejectRemark: null, createdAt: "2026-09-20T02:00:00Z" },
  { employee: "employee-1@budiman.com", supervisor: "supervisor-1@budiman.com", leaveType: "OTHER", startDate: "2026-12-20", endDate: "2026-12-22", reason: "Moving house", status: "REJECTED", decidedBy: "supervisor-1@budiman.com", decidedAt: "2026-11-03T09:00:00Z", rejectRemark: "Release freeze – no leave in December", createdAt: "2026-11-01T02:00:00Z" },
  { employee: "employee-2@budiman.com", supervisor: "supervisor-2@budiman.com", leaveType: "ANNUAL", startDate: "2026-12-14", endDate: "2026-12-18", reason: "Holiday with family", status: "SUBMITTED", decidedBy: null, decidedAt: null, rejectRemark: null, createdAt: "2026-11-09T03:00:00Z" },
  { employee: "employee-2@budiman.com", supervisor: "supervisor-2@budiman.com", leaveType: "SICK", startDate: "2026-11-25", endDate: "2026-11-26", reason: "Food poisoning", status: "WITH_HR", decidedBy: null, decidedAt: null, rejectRemark: null, createdAt: "2026-11-05T02:00:00Z" },
  { employee: "employee-2@budiman.com", supervisor: "supervisor-2@budiman.com", leaveType: "SICK", startDate: "2026-10-01", endDate: "2026-10-03", reason: "Dengue fever", status: "REJECTED", decidedBy: "hr-2@budiman.com", decidedAt: "2026-09-25T09:00:00Z", rejectRemark: "No medical certificate attached", createdAt: "2026-09-18T02:00:00Z" },
];

async function main() {
  // The valid-value check the app also applies (constants.ts guards).
  for (const r of REQUESTS) {
    if (!isLeaveType(r.leaveType) || !isLeaveStatus(r.status)) {
      throw new Error(`Bad seed row: ${r.leaveType}/${r.status}`);
    }
  }

  // Reset the data so the seed is repeatable.
  await prisma.leaveRequest.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const ids = new Map<string, number>();
  for (const user of USERS) {
    const created = await prisma.user.create({ data: { ...user, passwordHash } });
    ids.set(user.email, created.id);
  }

  for (const r of REQUESTS) {
    const employeeId = ids.get(r.employee);
    const supervisorId = ids.get(r.supervisor);
    if (employeeId === undefined || supervisorId === undefined) {
      throw new Error(`Seed row references an unknown user`);
    }
    await prisma.leaveRequest.create({
      data: {
        employeeId,
        supervisorId,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        days: leaveDays(r.startDate, r.endDate),
        reason: r.reason,
        status: r.status,
        rejectRemark: r.rejectRemark,
        decidedByUserId: r.decidedBy ? ids.get(r.decidedBy) ?? null : null,
        decidedAt: r.decidedAt ? new Date(r.decidedAt) : null,
        createdAt: new Date(r.createdAt),
      },
    });
  }

  console.log(`Seeded ${USERS.length} demo users (password: password123):`);
  for (const user of USERS) console.log(`  ${user.email.padEnd(26)} ${user.role}`);
  console.log(`Seeded ${REQUESTS.length} demo leave requests:`);
  for (const r of REQUESTS) {
    const who = r.employee.split("@")[0].padEnd(12);
    const span = `${r.startDate} → ${r.endDate}`;
    console.log(`  ${who} ${r.leaveType.padEnd(7)} ${span}  ${r.status}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
