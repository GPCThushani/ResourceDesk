import { Suspense } from "react";
import { connection } from "next/server";

import MyReservationsManager from "@/components/reservations/MyReservationsManager";
import { getMyReservations } from "@/server/services/my-reservations";

async function MyReservationsContent() {
  await connection();

  const reservations = await getMyReservations();

  const serializedReservations = reservations.map((reservation) => ({
    id: reservation.id,
    bookingReference: reservation.bookingReference,
    purpose: reservation.purpose,
    startTime: reservation.startTime.toISOString(),
    endTime: reservation.endTime.toISOString(),
    status: reservation.status,
    rejectionReason: reservation.rejectionReason,
    createdAt: reservation.createdAt.toISOString(),
    reviewedAt: reservation.reviewedAt?.toISOString() ?? null,
    resource: reservation.resource,
    approver: reservation.approver,
    reviewedBy: reservation.reviewedBy,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Reservation Management
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-[#14263D]">
          My Reservations
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Track your bookings, review approval decisions, and cancel
          upcoming reservations.
        </p>
      </div>

      <MyReservationsManager reservations={serializedReservations} />
    </div>
  );
}

export default function MyReservationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded-lg bg-white" />
          <div className="h-96 animate-pulse rounded-lg bg-white" />
        </div>
      }
    >
      <MyReservationsContent />
    </Suspense>
  );
}