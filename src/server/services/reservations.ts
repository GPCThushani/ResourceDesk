
import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import {
  createReservationSchema,
  type CreateReservationInput,
} from "@/validations/reservation";

export type ReservationResult = {
  success: boolean;
  message: string;
  reservationId?: string;
  bookingReference?: string;
  status?: "PENDING" | "CONFIRMED";
};

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export async function createReservation(
  input: CreateReservationInput
): Promise<ReservationResult> {
  const user = await getCurrentUser();

  const validation = createReservationSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Invalid reservation details.",
    };
  }

  const data = validation.data;
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  const now = new Date();

  if (startTime <= now) {
    return {
      success: false,
      message: "Reservation start time must be in the future.",
    };
  }

  if (startTime.getTime() > now.getTime() + 30 * DAY) {
    return {
      success: false,
      message: "Reservations can only be made up to 30 days in advance.",
    };
  }

  const resource = await prisma.resource.findFirst({
    where: {
      id: data.resourceId,
      status: "ACTIVE",
      OR: [
        { accessScope: "ORGANIZATION" },
        ...(user.departmentId
          ? [
              {
                accessScope: "DEPARTMENT" as const,
                ownerDepartmentId: user.departmentId,
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      name: true,
      requiresApproval: true,
      ownerDepartmentId: true,
      ownerDepartment: {
        select: {
          headId: true,
        },
      },
    },
  });

  if (!resource) {
    return {
      success: false,
      message: "Resource not found, unavailable, or not accessible.",
    };
  }

  const conflictingReservation = await prisma.reservation.findFirst({
    where: {
      resourceId: resource.id,
      status: "CONFIRMED",
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: {
      id: true,
    },
  });

  if (conflictingReservation) {
    return {
      success: false,
      message:
        "This resource is already booked during the selected time.",
    };
  }

  let approverId: string | null = null;

  if (resource.requiresApproval) {
    if (resource.ownerDepartmentId) {
      // Department-owned resources:
      // Approval goes to the owning department head.
      approverId = resource.ownerDepartment?.headId ?? null;
    } else if (user.departmentId) {
      // Organization-owned resources:
      // Approval goes to the requester's department head.
      const department = await prisma.department.findUnique({
        where: { id: user.departmentId },
        select: { headId: true },
      });

      approverId = department?.headId ?? null;
    }

    if (!approverId) {
      return {
        success: false,
        message:
          "No department head is assigned to approve this resource.",
      };
    }

    if (approverId === user.id) {
      return {
        success: false,
        message: "You cannot approve your own reservation.",
      };
    }

    // Verify the assigned approver is an active department head.
    const approver = await prisma.user.findFirst({
      where: {
        id: approverId,
        role: "DEPARTMENT_HEAD",
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!approver) {
      return {
        success: false,
        message: "The assigned department head is not active.",
      };
    }
  }

  const status = resource.requiresApproval
    ? ("PENDING" as const)
    : ("CONFIRMED" as const);

  const bookingReference = `RD-${randomUUID().slice(0, 12).toUpperCase()}`;

  try {
    const reservation = await prisma.reservation.create({
      data: {
        bookingReference,
        purpose: data.purpose,
        startTime,
        endTime,
        status,
        userId: user.id,
        resourceId: resource.id,
        approverId,
      },
      select: {
        id: true,
        bookingReference: true,
        status: true,
      },
    });

    const reservationStatus = reservation.status as ReservationResult["status"];

    return {
      success: true,
      message:
        reservationStatus === "PENDING"
          ? "Reservation submitted for approval."
          : "Reservation confirmed successfully.",
      reservationId: reservation.id,
      bookingReference: reservation.bookingReference,
      status: reservationStatus,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2010"
    ) {
      return {
        success: false,
        message:
          "The selected time slot may have been booked by another user. Please choose another time.",
      };
    }

    
    if (
      error instanceof Error &&
      (error.message.includes("23P01") ||
        error.message.includes(
          "no_overlapping_confirmed_reservations"
        ))
    ) {
      return {
        success: false,
        message:
          "This resource is already booked during the selected time.",
      };
    }

    console.error("Reservation creation failed:", error);

    return {
      success: false,
      message: "Unable to create the reservation. Please try again.",
    };
  }
}
