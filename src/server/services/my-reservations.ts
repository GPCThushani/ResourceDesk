
import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CancellationResult = {
  success: boolean;
  message: string;
};

export async function getMyReservations() {
  const user = await getCurrentUser();

  return prisma.reservation.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      bookingReference: true,
      purpose: true,
      startTime: true,
      endTime: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      reviewedAt: true,
      resource: {
        select: {
          id: true,
          resourceCode: true,
          name: true,
          category: true,
          location: true,
          status: true,
        },
      },
      approver: {
        select: {
          name: true,
          email: true,
        },
      },
      reviewedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
    ],
  });
}

export type MyReservationItem =
  Awaited<ReturnType<typeof getMyReservations>>[number];

export async function cancelMyReservation(
  reservationId: string
): Promise<CancellationResult> {
  const user = await getCurrentUser();

  if (!UUID_PATTERN.test(reservationId)) {
    return {
      success: false,
      message: "Invalid reservation ID.",
    };
  }

  try {
    const result = await prisma.reservation.updateMany({
      where: {
        id: reservationId,
        userId: user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        startTime: {
          gt: new Date(),
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        message:
          "This reservation cannot be cancelled. It may already be completed, cancelled, rejected, or no longer in the future.",
      };
    }

    return {
      success: true,
      message: "Reservation cancelled successfully.",
    };
  } catch (error) {
    console.error("Reservation cancellation failed:", error);

    return {
      success: false,
      message:
        "Unable to cancel the reservation. Please try again.",
    };
  }
}
