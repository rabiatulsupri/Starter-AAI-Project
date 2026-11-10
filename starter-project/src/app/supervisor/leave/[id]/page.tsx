import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getVisibleRequest } from "@/lib/leave";
import { LeaveDetail } from "@/components/leave/LeaveDetail";
import { SignButton, RejectButton } from "@/components/leave/LeaveActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/Icons";

// One request addressed to this supervisor (design Part B §5). Anything else
// — another supervisor's request, an employee's — reaches the shared Not
// found page (AC-18).
export default async function SupervisorLeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("SUPERVISOR");
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  const request = await getVisibleRequest(n, user);

  return (
    <>
      <PageHeader
        title={`Leave request #${request.id}`}
        description="Only the addressed supervisor signs or rejects a request."
        action={
          <Link href="/supervisor" className={buttonClasses("secondary")}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to my queue
          </Link>
        }
      />

      <LeaveDetail request={request} viewerRole="SUPERVISOR" />

      {/* Only the initial SUBMITTED state can be decided here (Part A §2). */}
      {request.status === "SUBMITTED" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SignButton requestId={request.id} />
          <RejectButton requestId={request.id} />
        </div>
      ) : null}
    </>
  );
}
