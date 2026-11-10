import { Card } from "../ui/Card";
import { DetailList, type DetailRow } from "../ui/DetailSection";
import { StatusBadge } from "./StatusBadge";
import {
  formatTimestamp,
  LEAVE_TYPE_LABELS,
  type LeaveType,
  type Role,
} from "@/lib/constants";
import type { LeaveView } from "@/lib/leave";

// One request in full (design Part B §5): all fields, the remark when
// rejected, and who decided when (Assumptions A2, A5, A6).
export function LeaveDetail({
  request,
  viewerRole,
}: {
  request: LeaveView;
  viewerRole: Role;
}) {
  const rows: DetailRow[] = [
    {
      label: "Type",
      value: LEAVE_TYPE_LABELS[request.leaveType as LeaveType] ?? request.leaveType,
    },
    { label: "Status", value: <StatusBadge status={request.status} /> },
    {
      label: "Dates",
      value: `${formatTimestamp(request.startDate)} → ${formatTimestamp(request.endDate)}`,
    },
    {
      label: "Days",
      value: `${request.days} calendar ${request.days === 1 ? "day" : "days"}`,
    },
    { label: "Submitted", value: formatTimestamp(request.createdAt) },
    { label: "Supervisor", value: request.supervisorName },
    // Your own name is not a useful row; other roles see who requested.
    ...(viewerRole === "EMPLOYEE"
      ? []
      : [{ label: "Employee", value: request.employeeName }]),
    { label: "Reason", value: request.reason ?? "—", wide: true },
    ...(request.decidedByName
      ? [
          { label: "Decided by", value: request.decidedByName },
          {
            label: "Decided on",
            value: request.decidedAt ? formatTimestamp(request.decidedAt) : "—",
          },
        ]
      : []),
    ...(request.status === "REJECTED"
      ? [{ label: "Remark", value: request.rejectRemark ?? "—", wide: true }]
      : []),
  ];

  return (
    <Card className="p-5 sm:p-6">
      <DetailList rows={rows} />
    </Card>
  );
}
