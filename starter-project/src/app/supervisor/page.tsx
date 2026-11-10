import { requireRole } from "@/lib/auth";
import { listRequestsForViewer } from "@/lib/leave";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { SignButton, RejectButton } from "@/components/leave/LeaveActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";

// The Supervisor home page: the queue of requests addressed to this
// supervisor that await a signature, then their history (design Part B §5).
// Only Supervisor users can open it.
export default async function SupervisorPage() {
  const user = await requireRole("SUPERVISOR");
  const { toAct, history } = await listRequestsForViewer(user);

  return (
    <>
      <PageHeader
        title="Leave waiting for your signature"
        description="Sign a request so the employee can send it to HR, or reject it with a remark."
      />

      <Card className="mb-6">
        <CardHeader
          title="Needs your action"
          count={toAct.length}
          description="Requests from your division that await your signature."
        />
        <LeaveTable
          requests={toAct}
          hrefBase="/supervisor/leave"
          showEmployee
          emptyTitle="Nothing waits for your signature."
          emptyDescription="New requests from your division appear here."
          renderActions={(r) =>
            r.status === "SUBMITTED" ? (
              <>
                <SignButton requestId={r.id} />
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
          description="Every request that came to you."
        />
        <LeaveTable
          requests={history}
          hrefBase="/supervisor/leave"
          showEmployee
          emptyTitle="No requests have come to you yet."
        />
      </Card>
    </>
  );
}
