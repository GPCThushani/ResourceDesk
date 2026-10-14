"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cancelReservationAction } from "@/server/actions/my-reservations";

type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

type ReservationItem = {
  id: string;
  bookingReference: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  resource: {
    id: string;
    resourceCode: string;
    name: string;
    category: string;
    location: string | null;
    status: string;
  };
  approver: {
    name: string;
    email: string;
  } | null;
  reviewedBy: {
    name: string;
  } | null;
};

type Props = {
  reservations: ReservationItem[];
};

type FilterStatus = "ALL" | ReservationStatus;

type Feedback = {
  success: boolean;
  message: string;
};

const statusStyles: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-emerald-50 text-emerald-800",
  REJECTED: "bg-red-50 text-red-800",
  CANCELLED: "bg-slate-100 text-slate-700",
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

function canCancel(reservation: ReservationItem) {
  return (
    (reservation.status === "PENDING" ||
      reservation.status === "CONFIRMED") &&
    new Date(reservation.startTime).getTime() > Date.now()
  );
}

export default function MyReservationsManager({
  reservations = [],
}: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReservationItem | null>(
    null
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      ALL: reservations.length,
      PENDING: reservations.filter(
        (r) => r.status === "PENDING"
      ).length,
      CONFIRMED: reservations.filter(
        (r) => r.status === "CONFIRMED"
      ).length,
      REJECTED: reservations.filter(
        (r) => r.status === "REJECTED"
      ).length,
      CANCELLED: reservations.filter(
        (r) => r.status === "CANCELLED"
      ).length,
    }),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      if (
        filter !== "ALL" &&
        reservation.status !== filter
      ) {
        return false;
      }

      if (!query) return true;

      return [
        reservation.bookingReference,
        reservation.resource.name,
        reservation.resource.resourceCode,
        reservation.purpose,
      ].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [reservations, filter, search]);

  function handleCancellation() {
    if (!selected) return;

    const reservationId = selected.id;

    startTransition(async () => {
      try {
        const result = await cancelReservationAction(
          reservationId
        );

        setFeedback(result);

        if (result.success) {
          setSelected(null);
          router.refresh();
        }
      } catch {
        setFeedback({
          success: false,
          message:
            "Unable to cancel the reservation. Please try again.",
        });
      }
    });
  }

  const filters: FilterStatus[] = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "CANCELLED",
  ];

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Reservations",
            value: counts.ALL,
          },
          {
            label: "Pending Approval",
            value: counts.PENDING,
          },
          {
            label: "Confirmed",
            value: counts.CONFIRMED,
          },
          {
            label: "Cancelled",
            value: counts.CANCELLED,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-600">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-semibold text-[#14263D]">
              {card.value}
            </p>
          </div>
        ))}
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

      {/* Reservation History */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="space-y-4 border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#14263D]">
                Reservation History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredReservations.length} reservation(s)
                displayed
              </p>
            </div>

            <Link
              href="/reservations/new"
              className="rounded-md bg-[#14263D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#223D5C]"
            >
              + New Reservation
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search reservations..."
              aria-label="Search reservations"
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#14263D] sm:max-w-xs"
            />

            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                    filter === item
                      ? "border-[#14263D] bg-[#14263D] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item === "ALL"
                    ? "All"
                    : item.charAt(0) +
                      item.slice(1).toLowerCase()}{" "}
                  ({counts[item]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredReservations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold text-slate-800">
              No reservations found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {reservations.length === 0
                ? "You have not made any reservations yet."
                : "No reservations match your selected filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Resource</th>
                  <th className="px-5 py-4">
                    Booking Period
                  </th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Details</th>
                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map(
                  (reservation) => (
                    <tr
                      key={reservation.id}
                      className="align-top"
                    >
                      {/* Reference */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#14263D]">
                          {reservation.bookingReference}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Created{" "}
                          {formatDateTime(
                            reservation.createdAt
                          )}
                        </p>
                      </td>

                      {/* Resource */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/resources/${reservation.resource.id}`}
                          className="font-medium text-[#14263D] hover:underline"
                        >
                          {reservation.resource.name}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          {reservation.resource.resourceCode}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {reservation.resource.location ??
                            "Location not specified"}
                        </p>
                      </td>

                      {/* Booking Period */}
                      <td className="px-5 py-4 text-slate-700">
                        <p>
                          {formatDateTime(
                            reservation.startTime
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          to{" "}
                          {formatDateTime(
                            reservation.endTime
                          )}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                            statusStyles[
                              reservation.status
                            ]
                          }`}
                        >
                          {reservation.status.charAt(0) +
                            reservation.status
                              .slice(1)
                              .toLowerCase()}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="max-w-xs px-5 py-4">
                        <p className="line-clamp-2 text-slate-700">
                          {reservation.purpose}
                        </p>

                        {reservation.status ===
                          "PENDING" &&
                          reservation.approver && (
                            <p className="mt-2 text-xs text-amber-700">
                              Awaiting{" "}
                              {reservation.approver.name}
                            </p>
                          )}

                        {reservation.status ===
                          "REJECTED" &&
                          reservation.rejectionReason && (
                            <p className="mt-2 text-xs text-red-700">
                              Reason:{" "}
                              {reservation.rejectionReason}
                            </p>
                          )}

                        {reservation.reviewedBy &&
                          reservation.reviewedAt && (
                            <p className="mt-2 text-xs text-slate-500">
                              Reviewed by{" "}
                              {reservation.reviewedBy.name}{" "}
                              on{" "}
                              {formatDateTime(
                                reservation.reviewedAt
                              )}
                            </p>
                          )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {canCancel(reservation) ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setSelected(reservation);
                              setFeedback(null);
                            }}
                            className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel Booking
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cancellation Confirmation Dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <h2
                id="cancel-dialog-title"
                className="text-lg font-semibold text-[#14263D]"
              >
                Cancel Reservation?
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                This action will cancel your booking.
              </p>
            </div>

            <div className="space-y-3 px-6 py-5 text-sm">
              <p className="font-semibold text-slate-900">
                {selected.resource.name}
              </p>

              <p className="text-slate-600">
                Reference: {selected.bookingReference}
              </p>

              <p className="text-slate-600">
                {formatDateTime(selected.startTime)}
              </p>

              <p className="text-slate-600">
                to {formatDateTime(selected.endTime)}
              </p>

              <p className="rounded-md bg-amber-50 p-3 text-amber-800">
                If this reservation is confirmed,
                cancelling it will make the time slot
                available for other users.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setSelected(null)}
                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Keep Reservation
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleCancellation}
                className="rounded-md bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
              >
                {isPending
                  ? "Cancelling..."
                  : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}