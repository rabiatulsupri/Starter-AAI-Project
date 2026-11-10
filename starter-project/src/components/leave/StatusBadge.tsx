import { LEAVE_STATUS_LABELS, type LeaveStatus } from "@/lib/constants";

// A small coloured pill showing the status label from the design (Part A §2).
const TONES: Record<LeaveStatus, string> = {
  SUBMITTED: "bg-amber-100 text-amber-800",
  SIGNED: "bg-sky-100 text-sky-800",
  WITH_HR: "bg-violet-100 text-violet-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status as LeaveStatus] ?? "bg-slate-100 text-slate-600";
  const label = LEAVE_STATUS_LABELS[status as LeaveStatus] ?? status;
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
