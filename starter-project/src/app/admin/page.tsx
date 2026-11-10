import { requireRole } from "@/lib/auth";
import { listRequestsForViewer } from "@/lib/leave";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";

// The Admin home page: a read-only view of every request in the company.
// Admins act on nothing (Part A: Admin sees all, decides nothing, AC-24).
export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const { history } = await listRequestsForViewer(user);

  return (
    <>
      <PageHeader
        title="All leave requests"
        description="A read-over-the-shoulder view for Admins. Admins never approve or reject."
      />

      <Card>
        <CardHeader
          title="Every request"
          count={history.length}
          description="All divisions, all statuses. Open a row to read it."
        />
        <LeaveTable
          requests={history}
          hrefBase="/admin/leave"
          showEmployee
          showSupervisor
          emptyTitle="No leave requests yet."
        />
      </Card>
    </>
  );
}
