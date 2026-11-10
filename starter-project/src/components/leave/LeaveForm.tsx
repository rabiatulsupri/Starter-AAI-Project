"use client";

import { useRef, useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeaveRequestAction } from "@/app/actions";
import { LEAVE_TYPES, LEAVE_TYPE_LABELS, leaveDays, type LeaveType } from "@/lib/constants";
import { Button } from "../ui/Button";
import { ErrorMessage, HelpText, Label, fieldClass } from "../ui/Field";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SuccessModal } from "../ui/SuccessModal";

// The request form (design Part B §5). Submitting opens the confirmation box
// first (U12); after success the pop-up returns to the employee home.
export function LeaveForm({ supervisors }: { supervisors: { id: number; name: string }[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createLeaveRequestAction, {});
  // The action is dispatched from the confirm box's click handler, so it must
  // run inside a transition — otherwise React logs an error and pending never
  // updates.
  const [, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  // The success pop-up is derived from the action state (no effect needed):
  // shown when the action succeeded and not yet dismissed.
  const [dismissed, setDismissed] = useState(false);
  const showSuccess = Boolean(state.ok) && !dismissed;
  const [leaveType, setLeaveType] = useState("");
  const [supervisorId, setSupervisorId] = useState(String(supervisors[0]?.id ?? ""));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const days = startDate && endDate ? leaveDays(startDate, endDate) : null;
  const supervisorName =
    supervisors.find((s) => s.id === Number(supervisorId))?.name ?? "your supervisor";

  function askConfirm() {
    // The browser's own required-field check runs first (AC-11).
    if (!formRef.current?.reportValidity()) return;
    setConfirming(true);
  }

  function submit() {
    setConfirming(false);
    setDismissed(false);
    const form = formRef.current;
    if (form) start(() => action(new FormData(form)));
  }

  const typeLabel = LEAVE_TYPE_LABELS[leaveType as LeaveType];
  const daysText =
    days === null
      ? ""
      : days >= 1
        ? `That is ${days} calendar ${days === 1 ? "day" : "days"}.`
        : "The end date is before the start date.";
  const summary =
    leaveType && startDate && endDate
      ? `${typeLabel} leave, ${startDate} → ${endDate}${
          days !== null && days >= 1 ? ` (${days} ${days === 1 ? "day" : "days"})` : ""
        }, to ${supervisorName}.`
      : "Your request will go to your supervisor for a decision.";

  return (
    <>
      <form
        ref={formRef}
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          askConfirm();
        }}
      >
        <ErrorMessage message={state.error} />

        <div>
          <Label htmlFor="leaveType">Leave type</Label>
          <select
            id="leaveType"
            name="leaveType"
            required
            className={fieldClass()}
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">Choose a leave type…</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {LEAVE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="supervisorId">Supervisor</Label>
          <select
            id="supervisorId"
            name="supervisorId"
            required
            className={fieldClass()}
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
          >
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <HelpText>Only supervisors of your own division (Part A rule 3).</HelpText>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className={fieldClass()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End date</Label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              className={fieldClass()}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {daysText ? (
              <p
                className={`mt-1 text-xs ${
                  days !== null && days < 1 ? "font-medium text-red-600" : "text-slate-500"
                }`}
              >
                {daysText}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Reason (optional)</Label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            className={fieldClass()}
            placeholder="Your supervisor and HR will see this. Leave it empty if you prefer."
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit request"}
        </Button>
      </form>

      <ConfirmDialog
        open={confirming}
        title="Submit this leave request?"
        message={summary}
        confirmLabel="Submit"
        onCancel={() => setConfirming(false)}
        onConfirm={submit}
      />

      <SuccessModal
        open={showSuccess}
        title="Request submitted"
        message={state.message}
        actionLabel="Back to my requests"
        onAction={() => {
          setDismissed(true);
          router.push("/employee");
          router.refresh();
        }}
      />
    </>
  );
}
