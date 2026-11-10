import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { supervisorsInDivision } from "@/lib/leave";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/Icons";

// The request form (design Part B §5). If the division has no Supervisor the
// form is replaced by a clear message and submission is blocked (AC-14).
export default async function NewLeaveRequestPage() {
  const user = await requireRole("EMPLOYEE");
  const supervisors = await supervisorsInDivision(user.division);

  return (
    <>
      <PageHeader
        title="New leave request"
        description="Your supervisor decides first; once signed you send it to HR."
        action={
          <Link href="/employee" className={buttonClasses("secondary")}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>
        }
      />

      {supervisors.length === 0 ? (
        <Card>
          <EmptyState
            title="No supervisor is available in your division"
            description="A leave request must go to a supervisor of your own division, so you cannot submit one right now. Please contact HR."
          />
        </Card>
      ) : (
        <Card className="max-w-2xl p-6">
          <LeaveForm supervisors={supervisors.map((s) => ({ id: s.id, name: s.name }))} />
        </Card>
      )}
    </>
  );
}
