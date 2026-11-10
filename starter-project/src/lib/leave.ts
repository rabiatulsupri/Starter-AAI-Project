// Server-side helpers for the Leave Request module (design Part B §7).
// Every role and status check for opening a request lives in this file, so
// pages and server actions share one source of truth (AC-25).

import { notFound } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "./db";
import type { Role } from "./constants";

// A request with the display names of the people involved, ready for screens.
export type LeaveView = {
  id: number;
  employeeId: number;
  supervisorId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  rejectRemark: string | null;
  decidedByUserId: number | null;
  decidedAt: Date | null;
  createdAt: Date;
  employeeName: string;
  supervisorName: string;
  decidedByName: string | null;
};

// Which rows a role may open (design Part A §4), as a Prisma where fragment.
function visibleWhere(user: User) {
  switch (user.role as Role) {
    case "EMPLOYEE":
      return { employeeId: user.id };
    case "SUPERVISOR":
      return { supervisorId: user.id };
    default:
      // HR and Admin may open every request.
      return {};
  }
}

// Attaches the employee, supervisor and decider display names (the schema
// stores plain User ids). Keeps every other field of the row.
async function withPeople<
  T extends { employeeId: number; supervisorId: number; decidedByUserId: number | null },
>(
  rows: T[],
): Promise<(T & { employeeName: string; supervisorName: string; decidedByName: string | null })[]> {
  const userIds = [
    ...new Set(
      rows.flatMap((r) => [r.employeeId, r.supervisorId, r.decidedByUserId]),
    ).values(),
  ].filter((v): v is number => v !== null);
  const people = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } } })
    : [];
  const names = new Map(people.map((p) => [p.id, p.name]));
  return rows.map((r) => ({
    ...r,
    employeeName: names.get(r.employeeId) ?? "Unknown",
    supervisorName: names.get(r.supervisorId) ?? "Unknown",
    decidedByName:
      r.decidedByUserId === null ? null : names.get(r.decidedByUserId) ?? "Unknown",
  }));
}

// The home-page lists for the viewer: the requests they can act on now, and
// every request they may open (design Part B §5). Newest first.
export async function listRequestsForViewer(
  user: User,
): Promise<{ toAct: LeaveView[]; history: LeaveView[] }> {
  const rows = await prisma.leaveRequest.findMany({
    where: visibleWhere(user),
    orderBy: { createdAt: "desc" },
  });
  const decorated = await withPeople(rows);

  let isToAct: (r: LeaveView) => boolean;
  switch (user.role as Role) {
    case "EMPLOYEE":
      isToAct = (r) => r.status !== "APPROVED" && r.status !== "REJECTED";
      break;
    case "SUPERVISOR":
      isToAct = (r) => r.status === "SUBMITTED";
      break;
    case "HR":
      isToAct = (r) => r.status === "WITH_HR";
      break;
    default:
      // Admin is view only: nothing to act on (Part A rule 8).
      isToAct = () => false;
  }
  return { toAct: decorated.filter(isToAct), history: decorated };
}

// One request the viewer may open, or the shared Not found page — the same
// 404 as an unknown address, so a foreign id leaks nothing (design §8).
export async function getVisibleRequest(id: number, user: User): Promise<LeaveView> {
  const found = await prisma.leaveRequest.findFirst({ where: { id, ...visibleWhere(user) } });
  if (!found) notFound();
  const [row] = await withPeople([found]);
  return row;
}

// The Supervisors of one division, for the request form (Part A rule 3).
export async function supervisorsInDivision(division: string) {
  return prisma.user.findMany({
    where: { role: "SUPERVISOR", division },
    orderBy: { name: "asc" },
  });
}
