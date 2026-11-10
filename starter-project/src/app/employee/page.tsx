import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { listRequestsForViewer } from "@/lib/leave";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { SendToHrButton } from "@/components/leave/LeaveActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Icons";

// The Employee home page: own to-act list on top, own history below
// (design Part B §5). Only Employee users can open it.
export default async function EmployeePage() {
  const user = await requireRole("EMPLOYEE");
  const { toAct, history } = await listRequestsForViewer(user);

  return (
    <>
      <PageHeader
        title="My leave requests"
        description="Submit leave and follow it from your supervisor to HR."
        action={
          <Link href="/employee/leave/new" className={buttonClasses()}>
            <PlusIcon className="h-4 w-4" />
            New leave request
          </Link>
        }
      />

      <Card className="mb-6">
        <CardHeader
          title="Needs your action"
          count={toAct.length}
          description="Your requests that are not finished yet — signed ones can be sent to HR."
        />
        <LeaveTable
          requests={toAct}
          hrefBase="/employee/leave"
          showSupervisor
          emptyTitle="Nothing needs your action."
          emptyDescription="Requests you have sent appear here while they are not finished."
          renderActions={(r) =>
            // The same move as on the detail page, right from the list (AC-19).
            r.status === "SIGNED" ? <SendToHrButton requestId={r.id} /> : null
          }
        />
      </Card>

      <Card>
        <CardHeader
          title="History"
          count={history.length}
          description="Every request you have made."
        />
        <LeaveTable
          requests={history}
          hrefBase="/employee/leave"
          showSupervisor
          emptyTitle="No leave requests yet."
          emptyDescription="Use New leave request to submit your first one."
        />
      </Card>
    </>
  );
}
