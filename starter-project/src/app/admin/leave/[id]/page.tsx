import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getVisibleRequest } from "@/lib/leave";
import { LeaveDetail } from "@/components/leave/LeaveDetail";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/Icons";

// One request seen as Admin: read-only, with no action buttons anywhere
// (AC-24). Admins open any request but act on none.
export default async function AdminLeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("ADMIN");
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n)) notFound();
  const request = await getVisibleRequest(n, user);

  return (
    <>
      <PageHeader
        title={`Leave request #${request.id}`}
        description="Admins can read every request but never act on one."
        action={
          <Link href="/admin" className={buttonClasses("secondary")}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to all requests
          </Link>
        }
      />

      <LeaveDetail request={request} viewerRole="ADMIN" />
    </>
  );
}
