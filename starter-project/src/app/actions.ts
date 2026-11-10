"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  getCurrentUser,
  startSession,
  endSession,
  roleHome,
} from "@/lib/auth";
import {
  formatTimestamp,
  isLeaveType,
  LEAVE_TYPE_LABELS,
  leaveDays,
  type Role,
} from "@/lib/constants";

// Server actions: functions that run on the server when a button is pressed.
// Every action checks who is logged in and what they may do — hiding a button
// is not enough (design §8, AC-25).

export type ActionResult = { error?: string; ok?: boolean; message?: string };

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await startSession(user);
  // The sidebar frame lives in the root layout; without this the client can
  // reuse the cached logged-out layout and land on the dashboard with no frame.
  revalidatePath("/", "layout");
  redirect(roleHome(user.role as Role));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  // The sidebar frame lives in the root layout; without this the client can
  // reuse the cached logged-in layout and show the frame around the login page.
  revalidatePath("/", "layout");
  redirect("/login");
}

// ---- Leave Request ----

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Create a request (Part A rules 1–4): Employee only, valid type, end on or
// after start, supervisor from the employee's own division. The owner is the
// logged-in user, never a form value.
export async function createLeaveRequestAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Please log in again." };
  if (user.role !== "EMPLOYEE") {
    return { error: "Only Employees can submit leave requests." };
  }

  const leaveType = String(formData.get("leaveType") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const supervisorId = Number(formData.get("supervisorId"));

  if (!isLeaveType(leaveType)) return { error: "Choose a leave type." };
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    return { error: "Fill in both dates." };
  }
  const days = leaveDays(startDate, endDate);
  if (days < 1) return { error: "The end date cannot be before the start date." };

  const supervisor = await prisma.user.findUnique({ where: { id: supervisorId } });
  if (
    !supervisor ||
    supervisor.role !== "SUPERVISOR" ||
    supervisor.division !== user.division
  ) {
    return { error: "Choose a supervisor from your own division." };
  }

  await prisma.leaveRequest.create({
    data: {
      employeeId: user.id,
      supervisorId: supervisor.id,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason || null,
      status: "SUBMITTED",
    },
  });

  revalidatePath("/employee");
  const label = LEAVE_TYPE_LABELS[leaveType];
  return {
    ok: true,
    message: `${label} leave ${formatTimestamp(startDate)} → ${formatTimestamp(endDate)} (${days} ${days === 1 ? "day" : "days"}) is with ${supervisor.name}.`,
  };
}
