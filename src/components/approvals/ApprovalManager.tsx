
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approveReservation,
  rejectReservation,
} from "@/server/actions/approvals";

type ApprovalItem = {
  id: string;
  bookingReference: string;
  purpose: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
  resource: {
    id: string;
    resourceCode: string;
    name: string;
    category: string;
    location: string | null;
    status: string;
  };
};

type Props = {
  approvals: ApprovalItem[];
};

type Feedback = {
  success: boolean;
  message: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export default function ApprovalManager({ approvals }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredApprovals = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return approvals;

    return approvals.filter((approval) =>
      [
        approval.bookingReference,
        approval.resource.name,
        approval.resource.resourceCode,
        approval.user.name,
        approval.user.email,
        approval.purpose,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [approvals, search]);

  function openDecision(
    approval: ApprovalItem,
    nextDecision: "APPROVE" | "REJECT"
  ) {
    setSelected(approval);
    setDecision(nextDecision);
    setRejectionReason("");
    setFeedback(null);
  }

  function closeDecision() {
    if (isPending) return;

    setSelected(null);
    setDecision(null);
    setRejectionReason("");
  }

  function handleDecision() {
    if (!selected || !decision) return;

    if (
      decision === "REJECT" &&
      (rejectionReason.trim().length < 5 ||
        rejectionReason.trim().length > 500)
    ) {
      setFeedback({
        success: false,
        message:
          "Rejection reason must contain between 5 and 500 characters.",
      });
      return;
    }

    const reservationId = selected.id;
    const currentDecision = decision;
    const reason = rejectionReason;

    startTransition(async () => {
      try {
        const result =
          currentDecision === "APPROVE"
            ? await approveReservation(reservationId)
            : await rejectReservation(reservationId, reason);

        setFeedback(result);

        if (result.success) {
          setSelected(null);
          setDecision(null);
          setRejectionReason("");
          router.refresh();
        }
      } catch {
        setFeedback({
          success: false,
          message:
            "Unable to process this reservation. Please try again.",
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-600">
          Requests Awaiting Your Review
        </p>

        <p className="mt-2 text-3xl font-semibold text-[#14263D]">
          {approvals.length}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Assigned pending reservation requests
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          role={feedback.success ? "status" : "alert"}
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Approval Table */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#14263D]">
              Approval Queue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredApprovals.length} request(s) displayed
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests..."
            aria-label="Search approval requests"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#14263D] sm:w-64"
          />
        </div>

        {filteredApprovals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold text-slate-800">
              No pending approvals
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "No requests match your search."
                : "You have no reservation requests awaiting review."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Resource</th>
                  <th className="px-5 py-4">Requested By</th>
                  <th className="px-5 py-4">Booking Period</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApprovals.map((approval) => (
                  <tr key={approval.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#14263D]">
                        {approval.bookingReference}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(approval.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {approval.resource.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {approval.resource.resourceCode}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {approval.resource.location ?? "No location"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {approval.user.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {approval.user.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {approval.user.department ??
                          "No department"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <p>{formatDateTime(approval.startTime)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        to {formatDateTime(approval.endTime)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                        Pending
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            openDecision(approval, "APPROVE")
                          }
                          className="rounded-md bg-[#14263D] px-3 py-2 text-xs font-medium text-white hover:bg-[#223D5C] disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            openDecision(approval, "REJECT")
                          }
                          className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Decision Dialog */}
      {selected && decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-dialog-title"
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <h2
                id="approval-dialog-title"
                className="text-lg font-semibold text-[#14263D]"
              >
                {decision === "APPROVE"
                  ? "Approve Reservation"
                  : "Reject Reservation"}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {selected.bookingReference} — {selected.resource.name}
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-md bg-slate-50 p-4 text-sm">
                <p className="font-medium text-slate-900">
                  {selected.user.name}
                </p>

                <p className="mt-2 text-slate-600">
                  {formatDateTime(selected.startTime)}
                </p>

                <p className="mt-1 text-slate-600">
                  to {formatDateTime(selected.endTime)}
                </p>

                <p className="mt-3 font-medium text-slate-800">
                  Purpose
                </p>

                <p className="mt-1 whitespace-pre-wrap text-slate-600">
                  {selected.purpose}
                </p>
              </div>

              {decision === "REJECT" && (
                <div>
                  <label
                    htmlFor="rejection-reason"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Rejection Reason *
                  </label>

                  <textarea
                    id="rejection-reason"
                    rows={4}
                    maxLength={500}
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(event.target.value)
                    }
                    placeholder="Explain why this reservation cannot be approved..."
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#14263D]"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    5–500 characters required.
                  </p>
                </div>
              )}

              {decision === "APPROVE" && (
                <p className="text-sm leading-6 text-slate-600">
                  The system will check resource availability again
                  before confirming this reservation.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                disabled={isPending}
                onClick={closeDecision}
                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDecision}
                className={`rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                  decision === "APPROVE"
                    ? "bg-[#14263D] hover:bg-[#223D5C]"
                    : "bg-red-700 hover:bg-red-800"
                }`}
              >
                {isPending
                  ? "Processing..."
                  : decision === "APPROVE"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
