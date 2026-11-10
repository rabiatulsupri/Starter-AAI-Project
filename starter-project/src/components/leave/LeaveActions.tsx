"use client";

import { useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveAction,
  rejectAction,
  sendToHrAction,
  signAction,
  type ActionResult,
} from "@/app/actions";
import { Button, type ButtonVariant } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SuccessModal } from "../ui/SuccessModal";
import { Modal } from "../ui/Modal";
import { Label, fieldClass } from "../ui/Field";

// The move buttons (U12): button → confirmation box → server action →
// success pop-up. The success modal is derived from the action state; Done
// refreshes the page data. Server actions re-check everything (AC-25).

function ActionButton<P>({
  label,
  variant = "primary",
  confirmTitle,
  confirmMessage,
  confirmLabel,
  successTitle,
  successMessage,
  run,
  payload,
}: {
  label: string;
  variant?: ButtonVariant;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel: string;
  successTitle: string;
  successMessage?: string;
  run: (prev: ActionResult, payload: P) => Promise<ActionResult>;
  payload: P;
}) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(run, {});
  // The dispatch is called from the confirm box's click handler, so it must
  // run inside a transition — React logs an error otherwise and pending
  // never updates.
  const [, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const showSuccess = Boolean(state.ok) && !dismissed;

  return (
    <>
      <Button
        variant={variant}
        disabled={pending}
        onClick={() => {
          setDismissed(false);
          setConfirming(true);
        }}
      >
        {pending ? "Working…" : label}
      </Button>
      {state.error ? (
        <p role="alert" className="self-center text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        danger={variant === "danger"}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          start(() => dispatch(payload));
        }}
      />
      <SuccessModal
        open={showSuccess}
        title={successTitle}
        message={successMessage}
        actionLabel="Done"
        onAction={() => {
          setDismissed(true);
          router.refresh();
        }}
      />
    </>
  );
}

export function SendToHrButton({ requestId }: { requestId: number }) {
  return (
    <ActionButton
      label="Send to HR"
      confirmTitle="Send this request to HR?"
      confirmMessage="An HR officer will decide on it in the shared queue, and the officer who acts is recorded."
      confirmLabel="Send to HR"
      successTitle="Sent to HR"
      successMessage="The request is now in the shared HR queue."
      run={sendToHrAction}
      payload={requestId}
    />
  );
}

export function SignButton({ requestId }: { requestId: number }) {
  return (
    <ActionButton
      label="Sign"
      confirmTitle="Sign this request?"
      confirmMessage="Once signed, the employee can send it to HR for the final decision."
      confirmLabel="Sign"
      successTitle="Request signed"
      successMessage="The employee can now send it to HR."
      run={signAction}
      payload={requestId}
    />
  );
}

export function ApproveButton({ requestId }: { requestId: number }) {
  return (
    <ActionButton
      label="Approve"
      variant="success"
      confirmTitle="Approve this request?"
      confirmMessage="The employee will see that HR approved it. You are recorded as the deciding officer."
      confirmLabel="Approve"
      successTitle="Request approved"
      successMessage="The employee can see the decision."
      run={approveAction}
      payload={requestId}
    />
  );
}

// Rejection needs a remark (Part A rule 5): an empty remark is refused
// before the action is even called — and again on the server.
export function RejectButton({ requestId }: { requestId: number }) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(rejectAction, {});
  // See ActionButton: the dispatch must run inside a transition.
  const [, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const showSuccess = Boolean(state.ok) && !dismissed;

  function confirm() {
    if (!remark.trim()) {
      setRemarkError("Please write a remark — the employee needs to know why.");
      return;
    }
    setRemarkError("");
    setDismissed(false);
    setOpen(false);
    start(() => dispatch({ id: requestId, remark: remark.trim() }));
  }

  return (
    <>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          setDismissed(false);
          setOpen(true);
        }}
      >
        {pending ? "Working…" : "Reject"}
      </Button>
      {state.error && !open ? (
        <p role="alert" className="self-center text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold text-slate-900">Reject this request?</h2>
        <p className="mt-1 text-sm text-slate-600">
          A remark is required. The employee will see it, and the request is then
          closed for good — a retry means a new request.
        </p>
        <div className="mt-4">
          <Label htmlFor="reject-remark">Remark</Label>
          <textarea
            id="reject-remark"
            rows={3}
            className={fieldClass(!!remarkError)}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Why is this request rejected?"
          />
          {remarkError ? (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {remarkError}
            </p>
          ) : null}
          {state.error ? (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {state.error}
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm}>
            Reject request
          </Button>
        </div>
      </Modal>
      <SuccessModal
        open={showSuccess}
        title="Request rejected"
        message="The employee can see your remark."
        actionLabel="Done"
        onAction={() => {
          setDismissed(true);
          router.refresh();
        }}
      />
    </>
  );
}
