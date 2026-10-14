
import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";

export type ApprovalResult = {
  success: boolean;
  message: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isBookingConflict(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P2004", "P2010"].includes(error.code)
  ) {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.message.includes("23P01") ||
      error.message.includes(
        "no_overlapping_confirmed_reservations"
      )
    );
  }

  return false;
}

export async function getPendingApprovals() {
  const user = await getCurrentUser();

  if (
    user.role !== "DEPARTMENT_HEAD" &&
    user.role !== "ADMIN"
  ) {
    throw new Error("You are not authorized to view approvals.");
  }

  return prisma.reservation.findMany({
    where: {
      status: "PENDING",
      approverId: user.id,
      userId: { not: user.id },
    },
    select: {
      id: true,
      bookingReference: true,
      purpose: true,
      startTime: true,
      endTime: true,
      createdAt: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
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
    },
    orderBy: [
      { startTime: "asc" },
      { createdAt: "asc" },
    ],
  });
}

export type PendingApprovalItem =
  Awaited<ReturnType<typeof getPendingApprovals>>[number];

export async function reviewReservation(
  reservationId: string,
  decision: "APPROVE" | "REJECT",
  rejectionReason?: string
): Promise<ApprovalResult> {
  const reviewer = await getCurrentUser();

  if (
    reviewer.role !== "DEPARTMENT_HEAD" &&
    reviewer.role !== "ADMIN"
  ) {
    return {
      success: false,
      message: "You are not authorized to review reservations.",
    };
  }

  if (!UUID_PATTERN.test(reservationId)) {
    return {
      success: false,
      message: "Invalid reservation ID.",
    };
  }

  if (decision !== "APPROVE" && decision !== "REJECT") {
    return {
      success: false,
      message: "Invalid approval decision.",
    };
  }

  const cleanReason = rejectionReason?.trim() ?? "";

  if (
    decision === "REJECT" &&
    (cleanReason.length < 5 || cleanReason.length > 500)
  ) {
    return {
      success: false,
      message:
        "Rejection reason must contain between 5 and 500 characters.",
    };
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      status: "PENDING",
      approverId: reviewer.id,
      userId: { not: reviewer.id },
    },
    select: {
      id: true,
      userId: true,
      resourceId: true,
      startTime: true,
      endTime: true,
      resource: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!reservation) {
    return {
      success: false,
      message:
        "Pending reservation not found or you are not its assigned approver.",
    };
  }

  if (decision === "REJECT") {
    try {
      const result = await prisma.reservation.updateMany({
        where: {
          id: reservationId,
          status: "PENDING",
          approverId: reviewer.id,
          userId: { not: reviewer.id },
        },
        data: {
          status: "REJECTED",
          rejectionReason: cleanReason,
          reviewedById: reviewer.id,
          reviewedAt: new Date(),
        },
      });

      if (result.count !== 1) {
        return {
          success: false,
          message:
            "This reservation has already been reviewed.",
        };
      }

      return {
        success: true,
        message: "Reservation rejected successfully.",
      };
    } catch (error) {
      console.error("Reservation rejection failed:", error);

      return {
        success: false,
        message: "Unable to reject the reservation.",
      };
    }
  }

  // Approval-specific checks.
  if (reservation.resource.status !== "ACTIVE") {
    return {
      success: false,
      message:
        "This resource is no longer active and cannot be approved.",
    };
  }

  if (reservation.startTime <= new Date()) {
    return {
      success: false,
      message:
        "This reservation has already started or expired.",
    };
  }

  const conflictingBooking = await prisma.reservation.findFirst({
    where: {
      resourceId: reservation.resourceId,
      status: "CONFIRMED",
      id: { not: reservationId },
      startTime: { lt: reservation.endTime },
      endTime: { gt: reservation.startTime },
    },
    select: {
      id: true,
    },
  });

  if (conflictingBooking) {
    return {
      success: false,
      message:
        "Cannot approve this reservation because the resource is already booked during the selected time.",
    };
  }

  try {
    const result = await prisma.reservation.updateMany({
      where: {
        id: reservationId,
        status: "PENDING",
        approverId: reviewer.id,
        userId: { not: reviewer.id },
      },
      data: {
        status: "CONFIRMED",
        rejectionReason: null,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        message:
          "This reservation has already been reviewed.",
      };
    }

    return {
      success: true,
      message: "Reservation approved successfully.",
    };
  } catch (error) {
    if (isBookingConflict(error)) {
      return {
        success: false,
        message:
          "Another reservation already occupies this time slot. Approval was not completed.",
      };
    }

    console.error("Reservation approval failed:", error);

    return {
      success: false,
      message: "Unable to approve the reservation.",
    };
  }
}
