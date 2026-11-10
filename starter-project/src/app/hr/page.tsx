import { requireRole } from "@/lib/auth";
import { listRequestsForViewer } from "@/lib/leave";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { ApproveButton, RejectButton } from "@/components/leave/LeaveActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";

// The HR home page: one shared queue of WITH_HR requests from every division
// — either officer can act — then the full history (design Part B §5, A4).
// Only HR users can open it.
export default async function HRPage() {
  const user = await requireRole("HR");
  const { toAct, history } = await listRequestsForViewer(user);

  return (
    <>
      <PageHeader
        title="Leave with HR"
        description="Approve or reject requests that supervisors have signed and employees have sent."
      />

      <Card className="mb-6">
        <CardHeader
          title="Waiting for HR"
          count={toAct.length}
          description="The shared queue from every division — either HR officer can decide."
        />
        <LeaveTable
          requests={toAct}
          hrefBase="/hr/leave"
          showEmployee
          emptyTitle="The HR queue is empty."
          emptyDescription="Requests appear here after an employee sends a signed request to HR."
          renderActions={(r) =>
            r.status === "WITH_HR" ? (
              <>
                <ApproveButton requestId={r.id} />
                <RejectButton requestId={r.id} />
              </>
            ) : null
          }
        />
      </Card>

      <Card>
        <CardHeader
          title="History"
          count={history.length}
          description="Every request in the company, whatever the division."
        />
        <LeaveTable
          requests={history}
          hrefBase="/hr/leave"
          showEmployee
          emptyTitle="No leave requests in the company yet."
        />
      </Card>
    </>
  );
}
