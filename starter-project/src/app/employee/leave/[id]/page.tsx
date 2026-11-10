import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getVisibleRequest } from "@/lib/leave";
import { LeaveDetail } from "@/components/leave/LeaveDetail";
import { SendToHrButton } from "@/components/leave/LeaveActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/Icons";

// One of the employee's own requests (design Part B §5). A foreign id reaches
// the shared Not found page — it leaks nothing. Rejected requests are inert:
// no edit, cancel or reopen anywhere (AC-23).
export default async function EmployeeLeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  const request = await getVisibleRequest(n, user);

  return (
    <>
      <PageHeader
        title={`Leave request #${request.id}`}
        description="Only you can follow and move your own request."
        action={
          <Link href="/employee" className={buttonClasses("secondary")}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to my requests
          </Link>
        }
      />

      <LeaveDetail request={request} viewerRole="EMPLOYEE" />

      {/* Only a signed request can be sent (AC-19). */}
      {request.status === "SIGNED" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SendToHrButton requestId={request.id} />
        </div>
      ) : null}
    </>
  );
}
