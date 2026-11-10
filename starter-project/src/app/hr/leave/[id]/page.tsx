import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getVisibleRequest } from "@/lib/leave";
import { LeaveDetail } from "@/components/leave/LeaveDetail";
import { ApproveButton, RejectButton } from "@/components/leave/LeaveActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/Icons";

// One request seen as HR (design Part B §5). HR opens any request in the
// company; the final decision needs the WITH_HR status and records the
// officer who acted (AC-21, AC-22).
export default async function HRLeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("HR");
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  const request = await getVisibleRequest(n, user);

  return (
    <>
      <PageHeader
        title={`Leave request #${request.id}`}
        description="The HR officer who decides here is recorded on the request."
        action={
          <Link href="/hr" className={buttonClasses("secondary")}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to the HR queue
          </Link>
        }
      />

      <LeaveDetail request={request} viewerRole="HR" />

      {request.status === "WITH_HR" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ApproveButton requestId={request.id} />
          <RejectButton requestId={request.id} />
        </div>
      ) : null}
    </>
  );
}
