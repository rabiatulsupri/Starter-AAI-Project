import Link from "next/link";
import { EmptyState } from "../ui/EmptyState";
import { StatusBadge } from "./StatusBadge";
import { formatTimestamp, LEAVE_TYPE_LABELS, type LeaveType } from "@/lib/constants";
import type { LeaveView } from "@/lib/leave";

// The request table used on every home page (design Part B §5). Columns per
// Assumption A8: type, dates, days, status, submitted — the Supervisor column
// is added for Employees, and the requester's name shows under the type for
// the other roles so they know whose request it is.
export function LeaveTable({
  requests,
  hrefBase,
  showSupervisor = false,
  showEmployee = false,
  emptyTitle,
  emptyDescription,
  renderActions,
}: {
  requests: LeaveView[];
  hrefBase: string; // e.g. "/employee/leave" — rows link to hrefBase/[id]
  showSupervisor?: boolean;
  showEmployee?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  renderActions?: (r: LeaveView) => React.ReactNode; // row buttons for home pages
}) {
  if (requests.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="py-2.5 pl-5 pr-4">Type</th>
            <th className="px-4 py-2.5">Dates</th>
            <th className="px-4 py-2.5">Days</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Submitted</th>
            {showSupervisor ? <th className="py-2.5 pl-4 pr-5">Supervisor</th> : null}
            {renderActions ? <th className="py-2.5 pl-4 pr-5 text-right">Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 last:border-0">
              <td className="py-3 pl-5 pr-4">
                <Link
                  href={`${hrefBase}/${r.id}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {LEAVE_TYPE_LABELS[r.leaveType as LeaveType] ?? r.leaveType}
                </Link>
                {showEmployee ? (
                  <p className="mt-0.5 text-xs text-slate-500">{r.employeeName}</p>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatTimestamp(r.startDate)} → {formatTimestamp(r.endDate)}
              </td>
              <td className="px-4 py-3 text-slate-600">{r.days}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatTimestamp(r.createdAt)}
              </td>
              {showSupervisor ? (
                <td className="px-4 py-3 pl-4 pr-5 text-slate-600">{r.supervisorName}</td>
              ) : null}
              {renderActions ? (
                <td className="py-3 pl-4 pr-5">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {renderActions(r)}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
